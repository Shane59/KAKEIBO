'use client';

import DataTable from "@/app/ui/dashboard/data-table";
import { useEffect, useState } from "react";

export default function Page() {
    const [tableData, setTableData] = useState<any[][]>([]);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [sheetName, setSheetName] = useState('Sheet1');
    const [range, setRange] = useState('A1');
    useEffect(() => {
        const storedData = localStorage.getItem('tableData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setTableData(parsedData);
        }
    }, []);
    const handleDataChange = (newData: any[][]) => {
        setTableData(newData);
        // Save to localStorage for persistence
        localStorage.setItem('tableData', JSON.stringify(newData));
    }

    const handleExportToGoogleSheets = async () => {
        setShowExportDialog(true);
    }

    const confirmExport = async () => {
        setShowExportDialog(false);
        try {
            // Remove header row (first row) before sending to Google Sheets
            const dataWithoutHeader = tableData.slice(1);
            
            const response = await fetch('/api/sheets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: dataWithoutHeader,
                    sheetName: sheetName,
                    range: range,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert(`Success! Updated ${result.updatedCells} cells in Google Sheets.\nSheet: ${sheetName}\nRange: ${range}\nSheet ID: ${result.spreadsheetId}`);
                console.log('Export result:', result);
            } else {
                alert(`Error: ${result.error || 'Failed to export to Google Sheets'}`);
            }
        } catch (error) {
            alert('Failed to export to Google Sheets');
        }
    }

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Edit
                </h1>
            </div>
            <div>
                {tableData.length > 0 && (
                <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
                    <DataTable
                        data={tableData} 
                        onExportToGoogleSheets={handleExportToGoogleSheets}
                        onDataChange={handleDataChange}
                    />
                </div>
                )}
            </div>
            
            {/* Export Dialog Modal */}
            {showExportDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl">
                            <h3 className="text-xl font-semibold flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export to Google Sheets
                            </h3>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sheet Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={sheetName}
                                        onChange={(e) => setSheetName(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., January2024, Transactions"
                                    />
                                    <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Starting Range
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={range}
                                        onChange={(e) => setRange(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., A1, B2, C1"
                                    />
                                    <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Where to start inserting data (e.g., A1 for top-left, B2 to skip first column)
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
                            <button
                                onClick={() => setShowExportDialog(false)}
                                className="px-6 py-2.5 text-gray-600 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmExport}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}