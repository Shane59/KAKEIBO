'use client'
 
import { useState } from "react";

interface DataTableProps {
    data: any[][];
    onExportToGoogleSheets?: () => void;
    onDataChange?: (newData: any[][]) => void;
}

interface ColumnAction {
    type: 'add' | 'delete';
    columnIndex?: number;
    columnName?: string;
    insertPosition?: 'before' | 'after';
}

const categories = [
    'Grocery', 'Transportation', 'Dine-in', 'Social', 'Education', 'Personal', 'Misc', 'Car'
]

const formatDate = (dateString: string): string => {
    try {
        // Try to parse various date formats
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateString; // Return original if can't parse
        }
        
        // Format as MM/DD/YYYY
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${month}/${day}/${year}`;
    } catch (error) {
        return dateString; // Return original if parsing fails
    }
}

// Editable text cell component
const EditableCell = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
    );
}

// Category dropdown component
const CategoryCell = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
            <option value="">Select category...</option>
            {categories.map((category) => (
                <option key={category} value={category}>
                    {category}
                </option>
            ))}
        </select>
    );
}
 
export default function DataTable({ data, onExportToGoogleSheets, onDataChange }: DataTableProps) {
    const [tableData, setTableData] = useState<any[][]>(data);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [showColumnDialog, setShowColumnDialog] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
    const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('after');

    if (!tableData || tableData.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No data to display
            </div>
        );
    }

    const removeRow = (rowIndex: number) => {
        const newData = [...tableData];
        // Remove the row (add 1 because headers are at index 0)
        newData.splice(rowIndex + 1, 1);
        setTableData(newData);
        
        // Update selected rows
        const newSelectedRows = new Set(selectedRows);
        newSelectedRows.delete(rowIndex);
        setSelectedRows(newSelectedRows);
        
        // Notify parent of change
        if (onDataChange) {
            onDataChange(newData);
        }
    }

    const toggleRowSelection = (rowIndex: number) => {
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(rowIndex)) {
            newSelectedRows.delete(rowIndex);
        } else {
            newSelectedRows.add(rowIndex);
        }
        setSelectedRows(newSelectedRows);
    }

    const deleteSelectedRows = () => {
        if (selectedRows.size === 0) return;
        
        const newData = [...tableData];
        // Remove selected rows (sort in descending order to avoid index issues)
        const sortedIndices = Array.from(selectedRows).sort((a, b) => b - a);
        sortedIndices.forEach(rowIndex => {
            newData.splice(rowIndex + 1, 1); // +1 because headers are at index 0
        });
        
        setTableData(newData);
        setSelectedRows(new Set());
        
        // Notify parent of change
        if (onDataChange) {
            onDataChange(newData);
        }
    }

    const addColumn = (columnName: string, columnIndex: number | null, position: 'before' | 'after') => {
        if (!columnName.trim()) return;
        
        const newData = tableData.map((row, index) => {
            const newRow = [...row];
            const insertIndex = columnIndex !== null 
                ? position === 'before' 
                    ? columnIndex 
                    : columnIndex + 1
                : row.length; // Default to end if no column selected
            
            if (index === 0) {
                // Header row - add new column name
                newRow.splice(insertIndex, 0, columnName.trim());
            } else {
                // Data rows - add empty value
                newRow.splice(insertIndex, 0, '');
            }
            return newRow;
        });
        
        setTableData(newData);
        setNewColumnName('');
        setSelectedColumnIndex(null);
        setShowColumnDialog(false);
        
        // Notify parent of change
        if (onDataChange) {
            onDataChange(newData);
        }
    }

    const openColumnDialog = (columnIndex: number | null = null) => {
        setSelectedColumnIndex(columnIndex);
        setInsertPosition('after'); // Reset to default
        setShowColumnDialog(true);
    }

    const deleteColumn = (columnIndex: number) => {
        const newData = tableData.map(row => {
            const newRow = [...row];
            newRow.splice(columnIndex, 1);
            return newRow;
        });
        
        setTableData(newData);
        
        // Notify parent of change
        if (onDataChange) {
            onDataChange(newData);
        }
    }
 
    const headers = tableData[0];
    const rows = tableData.slice(1);

    const handleCellChange = (rowIndex: number, cellIndex: number, value: string): void => {
        const newData = [...tableData];
        // Add 1 to rowIndex because headers are at index 0
        const actualRowIndex = rowIndex + 1;
        newData[actualRowIndex][cellIndex] = value;
        setTableData(newData);
        
        // Notify parent of change
        if (onDataChange) {
            onDataChange(newData);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Imported Data</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowColumnDialog(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Column
                    </button>
                    {selectedRows.size > 0 && (
                        <button
                            onClick={deleteSelectedRows}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Selected ({selectedRows.size})
                        </button>
                    )}
                    {onExportToGoogleSheets && (
                        <button
                            onClick={onExportToGoogleSheets}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Export to Google Sheets
                        </button>
                    )}
                </div>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12 px-6 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.size === rows.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(new Set(rows.map((_, index) => index)));
                                        } else {
                                            setSelectedRows(new Set());
                                        }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </th>
                            {headers.map((header: string, index: number) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{header}</span>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => openColumnDialog(index)}
                                                className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity"
                                                title="Add column before"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => deleteColumn(index)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                                title="Delete column"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row: any[], rowIndex: number) => (
                            <tr key={rowIndex} className={`hover:bg-gray-50 ${selectedRows.has(rowIndex) ? 'bg-blue-50' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(rowIndex)}
                                        onChange={() => toggleRowSelection(rowIndex)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                </td>
                                {row.map((cell: any, cellIndex: number) => {
                                    const isCategoryColumn = headers[cellIndex] === 'Category';
                                    const isDateColumn = headers[cellIndex] === 'Date';
                                    const isDateProcessedColumn = headers[cellIndex] === 'Date Processed';
                                    return (
                                        <td
                                            key={cellIndex}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {isCategoryColumn ? (
                                                <CategoryCell
                                                    value={cell}
                                                    onChange={(value: string) => handleCellChange(rowIndex, cellIndex, value)}
                                                />
                                            ) : isDateColumn || isDateProcessedColumn ? (
                                                <span>{formatDate(cell)}</span>
                                            ) : (
                                                <EditableCell
                                                    value={cell}
                                                    onChange={(value: string) => handleCellChange(rowIndex, cellIndex, value)}
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Add Column Dialog */}
            {showColumnDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl">
                            <h3 className="text-xl font-semibold flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {selectedColumnIndex !== null ? 'Insert Column' : 'Add New Column'}
                            </h3>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Column Name
                                </label>
                                <input
                                    type="text"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="e.g., Notes, Status, Priority"
                                    autoFocus
                                />
                            </div>
                            
                            {selectedColumnIndex !== null && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Insert Position
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="before"
                                                checked={insertPosition === 'before'}
                                                onChange={(e) => setInsertPosition(e.target.value as 'before' | 'after')}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">Before "{headers[selectedColumnIndex]}"</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="after"
                                                checked={insertPosition === 'after'}
                                                onChange={(e) => setInsertPosition(e.target.value as 'before' | 'after')}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm">After "{headers[selectedColumnIndex]}"</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowColumnDialog(false);
                                    setNewColumnName('');
                                }}
                                className="px-6 py-2.5 text-gray-600 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => addColumn(newColumnName, selectedColumnIndex, insertPosition)}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Add Column
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}