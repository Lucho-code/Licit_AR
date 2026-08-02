import React, { useState, useMemo, useEffect } from 'react';
import { Download, Plus, Trash2, Edit2, CheckCircle, TrendingDown, FileSpreadsheet, Scale, Save, X, UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { fmtLocal } from '../utils';
import ExcelJS from 'exceljs';

export interface Item {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Offer {
  offerorId: string;
  offerorName: string;
  prices: Record<string, number>;
}

const DEFAULT_ITEMS: Item[] = [];

const DEFAULT_OFFERS: Offer[] = [];

export function OfertasTab() {
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<Item | null>(null);

  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editOfferData, setEditOfferData] = useState<Offer | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedItems = localStorage.getItem('sim_ofertas_items');
    const savedOffers = localStorage.getItem('sim_ofertas_offers');
    if (savedItems) {
      try { setItems(JSON.parse(savedItems)); } catch (e) {}
    }
    if (savedOffers) {
      try { setOffers(JSON.parse(savedOffers)); } catch (e) {}
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('sim_ofertas_items', JSON.stringify(items));
    localStorage.setItem('sim_ofertas_offers', JSON.stringify(offers));
  }, [items, offers]);

  // Derived state: lowest price per item
  const bestPrices = useMemo(() => {
    const best: Record<string, { price: number; offerorId: string }> = {};
    items.forEach(item => {
      let minPrice = Infinity;
      let minOfferorId = '';
      offers.forEach(offer => {
        const p = offer.prices[item.id];
        if (p !== undefined && p < minPrice) {
          minPrice = p;
          minOfferorId = offer.offerorId;
        }
      });
      if (minPrice !== Infinity) {
        best[item.id] = { price: minPrice, offerorId: minOfferorId };
      }
    });
    return best;
  }, [items, offers]);

  const handleAddItem = () => {
    const newItem: Item = {
      id: `i${Date.now()}`,
      name: 'Nuevo Insumo',
      quantity: 1,
      unit: 'un'
    };
    setItems([...items, newItem]);
    setEditingItemId(newItem.id);
    setEditItemData(newItem);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    // Remove from offers
    setOffers(offers.map(o => {
      const newPrices = { ...o.prices };
      delete newPrices[id];
      return { ...o, prices: newPrices };
    }));
  };

  const handleAddOffer = () => {
    const newOffer: Offer = {
      offerorId: `o${Date.now()}`,
      offerorName: 'Nuevo Oferente',
      prices: {}
    };
    // Initialize prices with 0
    items.forEach(i => newOffer.prices[i.id] = 0);
    setOffers([...offers, newOffer]);
    setEditingOfferId(newOffer.offerorId);
    setEditOfferData(newOffer);
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(offers.filter(o => o.offerorId !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const payload = {
          fileData,
          fileType: file.type,
          fileName: file.name
        };

        const response = await fetch("/api/analyze-offers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al comunicarse con el servidor.");
        }

        const data = await response.json();
        
        if (data.success && data.items && data.offers) {
          setItems(data.items);
          setOffers(data.offers);
        } else {
          throw new Error("Estructura de respuesta inesperada desde el servidor.");
        }
        setIsAnalyzing(false);
      };
      reader.onerror = () => {
        setAnalyzeError("Error al leer el archivo localmente.");
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setAnalyzeError(err.message || "Error desconocido al procesar el archivo.");
      setIsAnalyzing(false);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Comparativa de Ofertas');

    // Headers
    const headers = ['Ítem', 'Unidad', 'Cantidad'];
    offers.forEach(o => {
      headers.push(`P.Unit - ${o.offerorName}`);
      headers.push(`Subtotal - ${o.offerorName}`);
    });
    headers.push('Oferta Ideal (Mejor P.Unit)');
    headers.push('Subtotal Ideal');

    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true };

    let totals = offers.map(() => 0);
    let totalIdeal = 0;

    items.forEach(item => {
      const row = [item.name, item.unit, item.quantity];
      const best = bestPrices[item.id];

      offers.forEach((offer, idx) => {
        const pUnit = offer.prices[item.id] || 0;
        const subtotal = pUnit * item.quantity;
        totals[idx] += subtotal;
        row.push(pUnit);
        row.push(subtotal);
      });

      if (best) {
        row.push(best.price);
        const sub = best.price * item.quantity;
        totalIdeal += sub;
        row.push(sub);
      } else {
        row.push(0);
        row.push(0);
      }

      sheet.addRow(row);
    });

    // Totals row
    const totalsRow = ['TOTALES', '', ''];
    offers.forEach((_, idx) => {
      totalsRow.push('');
      totalsRow.push(totals[idx] as any);
    });
    totalsRow.push('');
    totalsRow.push(totalIdeal as any);

    const tRow = sheet.addRow(totalsRow);
    tRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Comparativa_Ofertas.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#2D2A26] flex items-center gap-2">
            <Scale className="h-6 w-6 text-[#8C6A5A]" />
            Comparativa de Ofertas (Item a Item)
          </h2>
          <p className="text-[#5A554E] text-sm">
            Cargue ofertas de proveedores o subcontratistas para identificar el precio óptimo y la "oferta ideal".
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg" 
              onChange={handleFileUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isAnalyzing}
            />
            <button
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow transition-colors ${
                isAnalyzing ? 'bg-[#D9D2C5] text-[#7A746B]' : 'bg-[#3A3732] hover:bg-[#2D2A26] text-white'
              }`}
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isAnalyzing ? 'Analizando...' : 'Subir Oferta (IA)'}
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#5A716E] hover:bg-[#485B58] text-white px-4 py-2 rounded-xl text-sm font-bold shadow transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {analyzeError && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium">{analyzeError}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#D9D2C5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] border-b border-[#D9D2C5]">
              <tr>
                <th className="p-4 font-bold text-[#71715A] uppercase tracking-wider text-xs border-r border-[#D9D2C5]">Insumo / Rubro</th>
                <th className="p-4 font-bold text-[#71715A] uppercase tracking-wider text-xs border-r border-[#D9D2C5] w-20 text-center">Unidad</th>
                <th className="p-4 font-bold text-[#71715A] uppercase tracking-wider text-xs border-r border-[#D9D2C5] w-24 text-center">Cantidad</th>
                
                {offers.map((offer, idx) => (
                  <th key={offer.offerorId} className="p-4 border-r border-[#D9D2C5] min-w-[200px]">
                    {editingOfferId === offer.offerorId && editOfferData ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-[#D9D2C5] rounded bg-white text-sm"
                          value={editOfferData.offerorName}
                          onChange={e => setEditOfferData({...editOfferData, offerorName: e.target.value})}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => {
                              setOffers(offers.map(o => o.offerorId === offer.offerorId ? editOfferData : o));
                              setEditingOfferId(null);
                            }}
                            className="p-1 bg-[#5A716E] text-white rounded hover:bg-[#485B58]"
                          >
                            <Save className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditingOfferId(null)}
                            className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center group">
                        <div>
                          <div className="font-bold text-[#3A3732] flex items-center gap-1.5">
                            Oferta {idx + 1}
                          </div>
                          <div className="text-[#8C6A5A] text-xs mt-0.5">{offer.offerorName}</div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingOfferId(offer.offerorId); setEditOfferData(offer); }} className="text-[#A4947E] hover:text-[#5A716E] p-1">
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDeleteOffer(offer.offerorId)} className="text-[#A4947E] hover:text-red-600 p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </th>
                ))}

                <th className="p-4 font-bold text-[#5A716E] bg-[#5A716E]/5 uppercase tracking-wider text-xs min-w-[150px]">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Oferta Ideal
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const best = bestPrices[item.id];
                const isEditingItem = editingItemId === item.id;
                
                return (
                  <tr key={item.id} className="border-b border-[#D9D2C5]/40 hover:bg-[#FAF9F6]/50">
                    <td className="p-4 border-r border-[#D9D2C5]/40">
                      {isEditingItem && editItemData ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-[#D9D2C5] rounded bg-white text-sm"
                            value={editItemData.name}
                            onChange={e => setEditItemData({...editItemData, name: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-between items-center group">
                          <span className="font-medium text-[#2D2A26]">{item.name}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingItemId(item.id); setEditItemData(item); }} className="text-[#A4947E] hover:text-[#5A716E] p-1">
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-[#A4947E] hover:text-red-600 p-1">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 border-r border-[#D9D2C5]/40 text-center">
                      {isEditingItem && editItemData ? (
                        <input
                          type="text"
                          className="w-full px-1 py-1 border border-[#D9D2C5] rounded bg-white text-sm text-center"
                          value={editItemData.unit}
                          onChange={e => setEditItemData({...editItemData, unit: e.target.value})}
                        />
                      ) : (
                        <span className="text-[#7A746B]">{item.unit}</span>
                      )}
                    </td>
                    <td className="p-4 border-r border-[#D9D2C5]/40 text-center">
                      {isEditingItem && editItemData ? (
                        <div className="flex gap-1 flex-col">
                          <input
                            type="number"
                            className="w-full px-1 py-1 border border-[#D9D2C5] rounded bg-white text-sm text-center"
                            value={editItemData.quantity}
                            onChange={e => setEditItemData({...editItemData, quantity: parseFloat(e.target.value) || 0})}
                          />
                          <div className="flex gap-1 justify-center mt-1">
                            <button
                              onClick={() => {
                                setItems(items.map(i => i.id === item.id ? editItemData : i));
                                setEditingItemId(null);
                              }}
                              className="p-1 bg-[#5A716E] text-white rounded hover:bg-[#485B58]"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-[#3A3732]">{item.quantity}</span>
                      )}
                    </td>

                    {/* Offers columns */}
                    {offers.map(offer => {
                      const price = offer.prices[item.id] || 0;
                      const subtotal = price * item.quantity;
                      const isBest = best && best.offerorId === offer.offerorId;

                      return (
                        <td key={offer.offerorId} className={`p-4 border-r border-[#D9D2C5]/40 relative ${isBest ? 'bg-emerald-50/50' : ''}`}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#A4947E] w-8">P.U:</span>
                              <input
                                type="number"
                                className="flex-1 px-2 py-1 bg-transparent border-b border-transparent hover:border-[#D9D2C5] focus:border-[#5A716E] focus:outline-none font-mono text-sm text-right transition-colors"
                                value={price || ''}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setOffers(offers.map(o => {
                                    if (o.offerorId === offer.offerorId) {
                                      return { ...o, prices: { ...o.prices, [item.id]: val } };
                                    }
                                    return o;
                                  }));
                                }}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-[10px] text-[#A4947E]">=</span>
                              <span className={`font-mono text-sm ${isBest ? 'text-emerald-700 font-bold' : 'text-[#5A554E]'}`}>
                                {fmtLocal(subtotal)}
                              </span>
                            </div>
                          </div>
                          {isBest && (
                            <div className="absolute top-1 left-1" title="Mejor precio">
                              <TrendingDown className="h-3 w-3 text-emerald-600" />
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Ideal Offer column */}
                    <td className="p-4 bg-[#5A716E]/5 font-mono text-sm text-right">
                      {best ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[#5A716E] font-bold">{fmtLocal(best.price)}</span>
                          <span className="text-[#3A3732]">{fmtLocal(best.price * item.quantity)}</span>
                        </div>
                      ) : (
                        <span className="text-[#A4947E]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#EBE7DF] font-bold">
              <tr>
                <td colSpan={3} className="p-4 text-right text-[#5A554E] uppercase tracking-wider text-xs border-r border-[#D9D2C5]">
                  Total Propuestas
                </td>
                {offers.map(offer => {
                  const total = items.reduce((sum, item) => sum + (offer.prices[item.id] || 0) * item.quantity, 0);
                  return (
                    <td key={offer.offerorId} className="p-4 text-right font-mono text-[#2D2A26] border-r border-[#D9D2C5]">
                      {fmtLocal(total)}
                    </td>
                  );
                })}
                <td className="p-4 text-right font-mono text-emerald-800 bg-emerald-100/50">
                  {fmtLocal(items.reduce((sum, item) => sum + (bestPrices[item.id]?.price || 0) * item.quantity, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="p-4 bg-[#FAF9F6] border-t border-[#D9D2C5] flex justify-between">
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1 text-sm font-bold text-[#8C6A5A] hover:text-[#705448] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar Insumo
          </button>
          
          <button
            onClick={handleAddOffer}
            className="flex items-center gap-1 text-sm font-bold text-[#5A716E] hover:text-[#485B58] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar Nueva Oferta
          </button>
        </div>
      </div>
    </div>
  );
}
