"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Plus, 
  Trash2,
  GripVertical,
  Search,
  X
} from "lucide-react";
import Link from "next/link";
import { DatabaseService } from "@/lib/database-service";
import { type Database } from "@/lib/supabase";
import Image from "next/image";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];
type PackData = Database["public"]["Tables"]["sticker_packs"]["Row"];

interface SortableStickerProps {
  sticker: StickerData;
  onRemove: (stickerId: string) => void;
}

function SortableSticker({ sticker, onRemove }: SortableStickerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sticker.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src={sticker.thumbnail_url}
          alt={sticker.name}
          width={48}
          height={48}
          priority={true}
          className="object-contain"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{sticker.name}</p>
        <p className="text-xs text-gray-500">
          {sticker.download_count} downloads
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(sticker.id)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function EditPackPage() {
  const params = useParams();
  const router = useRouter();
  const packId = params.id as string;

  const [pack, setPack] = useState<PackData | null>(null);
  const [packStickers, setPackStickers] = useState<StickerData[]>([]);
  const [availableStickers, setAvailableStickers] = useState<StickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form state
  const [packName, setPackName] = useState("");
  const [packDescription, setPackDescription] = useState("");
  const [packCharacter, setPackCharacter] = useState("");
  const [packThumbnail, setPackThumbnail] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadPackData();
  }, [packId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPackData = async () => {
    try {
      setLoading(true);
      
      const [packData, unassignedStickers] = await Promise.all([
        DatabaseService.getPackById(packId),
        DatabaseService.getUnassignedStickers(),
      ]);

      setPack(packData);
      setPackStickers(packData.stickers);
      setAvailableStickers(unassignedStickers);
      
      // Set form values
      setPackName(packData.name);
      setPackDescription(packData.description || "");
      setPackCharacter(packData.character || "");
      setPackThumbnail(packData.thumbnail_url || "");
      
    } catch (error) {
      console.error("Error loading pack data:", error);
      toast.error("Error loading pack", {
        description: "Pack not found or access error occurred"
      });
      router.push("/admin/packs");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePack = async () => {
    if (!pack) return;

    try {
      setSaving(true);
      
      await DatabaseService.updatePack(pack.id, {
        name: packName,
        description: packDescription,
        character: packCharacter,
        thumbnail_url: packThumbnail,
      });

      toast.success("Pack successfully updated!", {
        description: "All changes have been saved"
      });
    } catch (error) {
      console.error("Error saving pack:", error);
      toast.error("Error saving pack", {
        description: "Please try again"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSticker = async (sticker: StickerData) => {
    // Check if sticker is already in pack (frontend check)
    if (packStickers.some(s => s.id === sticker.id)) {
      toast.warning("This sticker is already in the pack", {
        description: "You have already added this sticker to the pack"
      });
      return;
    }

    try {
      await DatabaseService.addStickerToPack(packId, sticker.id);
      
      // Update UI
      setPackStickers([...packStickers, sticker]);
      setAvailableStickers(availableStickers.filter(s => s.id !== sticker.id));
    } catch (error) {
      console.error("Error adding sticker to pack:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while adding sticker to pack";
      toast.error("Could not add sticker", {
        description: errorMessage
      });
    }
  };

  const handleRemoveSticker = async (stickerId: string) => {
    try {
      await DatabaseService.removeStickerFromPack(packId, stickerId);
      
      // Update UI
      const removedSticker = packStickers.find(s => s.id === stickerId);
      if (removedSticker) {
        setPackStickers(packStickers.filter(s => s.id !== stickerId));
        setAvailableStickers([...availableStickers, removedSticker]);
      }
    } catch (error) {
      console.error("Error removing sticker from pack:", error);
      toast.error("Could not remove sticker", {
        description: "An error occurred while removing sticker from pack"
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = packStickers.findIndex((sticker) => sticker.id === active.id);
    const newIndex = packStickers.findIndex((sticker) => sticker.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(packStickers, oldIndex, newIndex);
      setPackStickers(newOrder);

      // Update database order
      try {
        const stickerOrders = newOrder.map((sticker, index) => ({
          stickerId: sticker.id,
          order: index,
        }));
        
        await DatabaseService.updatePackItemOrder(packId, stickerOrders);
      } catch (error) {
        console.error("Error updating sticker order:", error);
        // Revert UI change if database update fails
        loadPackData();
      }
    }
  };

  const filteredAvailableStickers = availableStickers.filter(sticker =>
    sticker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sticker.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pack...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pack Not Found</h1>
            <Link href="/admin/packs">
              <Button>Back to Pack List</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/packs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit {pack.name}
              </h1>
              <p className="text-gray-600">
                Manage stickers and update pack information
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleSavePack}
            disabled={saving}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pack Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Pack Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pack-name">Pack Name</Label>
                <Input
                  id="pack-name"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Enter pack name"
                />
              </div>
              
              <div>
                <Label htmlFor="pack-description">Description</Label>
                <Input
                  id="pack-description"
                  value={packDescription}
                  onChange={(e) => setPackDescription(e.target.value)}
                  placeholder="Pack description"
                />
              </div>
              
              <div>
                <Label htmlFor="pack-character">Character</Label>
                <Input
                  id="pack-character"
                  value={packCharacter}
                  onChange={(e) => setPackCharacter(e.target.value)}
                  placeholder="Main character (e.g., Kermit)"
                />
              </div>

              <div>
                <Label htmlFor="pack-thumbnail">Thumbnail URL</Label>
                <Input
                  id="pack-thumbnail"
                  value={packThumbnail}
                  onChange={(e) => setPackThumbnail(e.target.value)}
                  placeholder="/stickers/source/sticker-name.png"
                />
                {packThumbnail && (
                  <div className="mt-2 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={packThumbnail}
                      alt="Pack thumbnail preview"
                      width={64}
                      height={64}
                      priority={true}
                      className="object-contain w-auto h-auto"
                      onError={() => setPackThumbnail("")}
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail Suggestions */}
              {packStickers.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">Thumbnail Suggestions</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {packStickers.slice(0, 8).map((sticker) => (
                      <button
                        key={`thumbnail-${sticker.id}`}
                        type="button"
                        onClick={() => setPackThumbnail(sticker.thumbnail_url)}
                        className={`w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                          packThumbnail === sticker.thumbnail_url 
                            ? "border-yellow-500" 
                            : "border-transparent hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={sticker.thumbnail_url}
                          alt={sticker.name}
                          width={48}
                          height={48}
                          priority={true}
                          className="object-contain w-auto h-auto"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sticker Count:</span>
                  <Badge variant="outline">{packStickers.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pack Stickers */}
          <Card>
            <CardHeader>
              <CardTitle>Pack Contents ({packStickers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={packStickers.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {packStickers.map((sticker) => (
                      <SortableSticker
                        key={`pack-${sticker.id}`}
                        sticker={sticker}
                        onRemove={handleRemoveSticker}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-lg">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Moving...</p>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {packStickers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No stickers in pack yet</p>
                  <p className="text-xs">Add stickers from the list on the right</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Stickers */}
          <Card>
            <CardHeader>
              <CardTitle>Available Stickers</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search stickers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAvailableStickers.length > 0 ? (
                  filteredAvailableStickers.map((sticker) => {
                    const isAlreadyInPack = packStickers.some(ps => ps.id === sticker.id);
                    return (
                    <div
                      key={`available-${sticker.id}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isAlreadyInPack 
                          ? "bg-gray-200 opacity-50" 
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                          src={sticker.thumbnail_url}
                          alt={sticker.name}
                          width={48}
                          height={48}
                          priority={true}
                          className="object-contain"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sticker.name}</p>
                        <div className="flex gap-1 mt-1">
                          {sticker.tags?.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={`${sticker.id}-tag-${tagIndex}-${tag}`} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSticker(sticker)}
                        disabled={isAlreadyInPack}
                        className={
                          isAlreadyInPack
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        }
                      >
                        {isAlreadyInPack ? "✓" : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      {searchQuery ? "No stickers found" : "All stickers are in packs"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}