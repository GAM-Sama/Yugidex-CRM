"use client"

import type { Card } from "@/types/card"
import { Badge } from "@/components/ui/badge"
import React, { useState, useEffect } from "react"
import { FlippableCard } from "@/components/ui/flippable-card"
import { cn, getCardGlowStyle } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeckCardPreviewProps {
  card: Card | null
  onDelete?: (cardId: string, quantity: number) => void
  isDeckEditor?: boolean
}

const parseDescription = (description: string) => {
  return description.split(/<br\s*\/?>/i).map((line, index, arr) => (
    <React.Fragment key={index}>
      {line}
      {index < arr.length - 1 && <br />}
    </React.Fragment>
  ))
}

export function DeckCardPreview({ card: propCard, onDelete, isDeckEditor = false }: DeckCardPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [card, setCard] = useState<Card | null>(propCard);
  const [deleteQuantity, setDeleteQuantity] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isManuallyFlipped, setIsManuallyFlipped] = useState(true);
  
  // Efecto para manejar la carga de la carta
  useEffect(() => {
    if (propCard) {
      setIsLoading(true);
      // Pequeño retraso para asegurar que los datos estén disponibles
      const timer = setTimeout(() => {
        setCard(propCard);
        setIsLoading(false);
        
        // Depuración: Mostrar datos de la carta en consola
        console.log('Datos de la carta cargados:', {
          nombre: propCard.name,
          tipo: propCard.monster_type,
          subtipo: propCard.subtype,
          escala_pendulo: propCard.pendulum_scale,
          esPendulum: (propCard.monster_type?.toLowerCase().includes('pendulum') || 
                       propCard.subtype?.toLowerCase().includes('pendulum')) && 
                      propCard.pendulum_scale != null,
          rawData: propCard
        });
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setCard(null);
      setIsLoading(false);
    }
  }, [propCard]);
  
  // Efecto para depuración: Mostrar datos de la carta cuando se monte el componente
  useEffect(() => {
    if (card) {
      const isPendulum = 
        (card.monster_type?.toLowerCase().includes('pendulum') || 
         card.subtype?.toLowerCase().includes('pendulum'));
         
      console.log('Datos de la carta seleccionada:', {
        name: card.name,
        monster_type: card.monster_type,
        subtype: card.subtype,
        pendulum_scale: card.pendulum_scale,
        isPendulum: isPendulum,
        rawData: card
      });
    }
  }, [card]);

  useEffect(() => {
    setIsManuallyFlipped(true)
  }, [card])

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    onDelete?.(card?.id || '', deleteQuantity)
    setShowDeleteDialog(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Selecciona una carta para ver los detalles</p>
      </div>
    );
  }


  // Only show delete button if not in deck editor mode and onDelete handler is provided
  const showDeleteButton = !isDeckEditor && onDelete
  
  const handleQuantityChange = (increment: number) => {
    if (!card) return
    const newQuantity = deleteQuantity + increment
    if (newQuantity >= 1 && newQuantity <= (card.quantity || 1)) {
      setDeleteQuantity(newQuantity)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Monster":
      case "Fusion Monster":
      case "Synchro Monster":
      case "XYZ Monster":
      case "Link Monster":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
      case "Spell":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
      case "Trap":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
    }
  }

  const getLevelLabel = () => {
    if (card.subtype?.includes("Xyz")) return "Rango:"
    if (card.subtype?.includes("Link")) return "Link:"
    return "Nivel:"
  }

  const getLevelValue = () => {
    if (card.subtype?.includes("Link")) {
      // Para monstruos Link, mostrar el valor de level_rank_link o 2 como valor por defecto
      return card.level_rank_link !== null ? card.level_rank_link : 2
    }
    return card.level_rank_link
  }

  return (
    // ESTAS CLASES SON CLAVE: h-full hace que ocupe todo el alto, y flex-col organiza el contenido verticalmente
    <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-3 h-full flex flex-col">
      {/* SECCIÓN FIJA: Título y Badges. flex-shrink-0 evita que se encoja */}
      <div className="mb-2 flex-shrink-0">
        <h2 className="text-md font-bold text-balance leading-tight mb-2">{card.name}</h2>
        <div className="flex flex-wrap gap-1">
          <Badge className={getTypeColor(card.card_type)}>{card.card_type}</Badge>
          {card.rarity && <Badge variant="outline">{card.rarity}</Badge>}
          {card.classification && <Badge variant="secondary">{card.classification}</Badge>}
          {card.subtype && <Badge variant="secondary">{card.subtype}</Badge>}
        </div>
      </div>

      {/* SECCIÓN FIJA: Imagen de la carta. flex-shrink-0 evita que se encoja */}
      <div
        style={getCardGlowStyle(card)}
        className="relative aspect-[59/86] w-full max-w-[200px] mx-auto mb-3 flex-shrink-0 cursor-pointer"
        onClick={() => setIsManuallyFlipped(prev => !prev)}
      >
        <FlippableCard
          card={card}
          isFlipped={isManuallyFlipped}
        />
      </div>

      {/* SECCIÓN CON SCROLL: flex-1 hace que ocupe el resto del espacio y overflow-y-auto añade el scroll si es necesario */}
      <div className="space-y-3 flex-1 overflow-y-auto text-xs pr-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <span className="font-medium text-muted-foreground block">Tipo:</span>
            <div className="text-foreground">
              {card.monster_type || card.card_type || 'No especificado'}
            </div>
          </div>
          {card.attribute && (
            <div>
              <span className="font-medium text-muted-foreground block">Atributo:</span>
              <div className="text-foreground">{card.attribute}</div>
            </div>
          )}
          {(card.level_rank_link != null || card.subtype?.includes("Link")) && (
            <div>
              <span className="font-medium text-muted-foreground block">{getLevelLabel()}</span>
              <div className="text-foreground">{getLevelValue()}</div>
            </div>
          )}
          {/* Mostrar ATK/DEF */}
          <div>
            <span className="font-medium text-muted-foreground block">ATK/DEF:</span>
            <div className="text-foreground font-bold">
              {card.atk !== undefined && card.atk !== null ? card.atk : '?'} / 
              {card.def !== undefined && card.def !== null ? card.def : '?'}
            </div>
          </div>
        </div>

        {card.card_icon && (
          <div>
            <span className="font-medium text-muted-foreground">Icono: </span>
            <span className="text-foreground">{card.card_icon}</span>
          </div>
        )}

        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        {/* Mostramos solo el 'set_code' para mayor precisión */}

        {/* {card.set_name && ( ... )} // <-- Eliminado */}

        {card.set_code && (
          <div>
            <span className="font-medium text-muted-foreground">Código de Pack: </span>
            <span className="text-foreground">{card.set_code}</span>
          </div>
        )}
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        {/* Mostrar Escala de Péndulo si es una carta Péndulo */}
        {(() => {
          const isPendulum = (card.monster_type?.toLowerCase().includes('pendulum') || 
                            card.subtype?.toLowerCase().includes('pendulum')) && 
                           card.pendulum_scale != null;
          
          if (isPendulum) {
            return (
              <div className="mt-2 p-2 bg-primary/10 rounded-md">
                <span className="font-medium text-primary">Escala de Péndulo: </span>
                <span className="font-bold">{card.pendulum_scale}</span>
              </div>
            );
          }
          return null;
        })()}

        {card.description && (
          <div className="border-t border-border/50 pt-2">
            <h4 className="text-xs font-medium mb-1 text-muted-foreground">Efecto:</h4>
            <p className="text-xs text-foreground/90 text-pretty leading-relaxed bg-muted/30 p-2 rounded">
              {parseDescription(card.description)}
            </p>
          </div>
        )}
        {/* Delete Button with Quantity Selector - Inside scrollable area */}
        {showDeleteButton && card && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Cantidad a borrar:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={deleteQuantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center font-medium">{deleteQuantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(1)}
                  disabled={deleteQuantity >= (card.quantity || 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full"
              onClick={handleDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteQuantity > 1 ? `Eliminar ${deleteQuantity} copias` : 'Eliminar 1 copia'}
            </Button>
            
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteQuantity > 1 
                      ? `Vas a eliminar ${deleteQuantity} copias de esta carta. Esta acción no se puede deshacer.`
                      : 'Vas a eliminar 1 copia de esta carta. Esta acción no se puede deshacer.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleConfirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteQuantity > 1 ? `Eliminar ${deleteQuantity} copias` : 'Eliminar 1 copia'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  )
}