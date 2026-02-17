'use server'

import * as XLSX from 'xlsx';
import { GoogleGenerativeAI } from "@google/generative-ai";

const excelExtentions = ['xls', 'xcel'];
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const askGemini = async (prompt: string): Promise<string> => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        return 'Other';
    }
};


export async function uploadFile(formData: FormData): Promise<any[]> {
    const file = formData.get('file') as File;
    
    if (!file) {
        throw new Error("File not uploaded.");
    }

    const extention = file.name.split('.')?.pop();

    const startRow = Number(formData.get('startRow'));
    const endRow = Number(formData.get('endRow'));
    const startCol = formData.get('startCol') as string;
    const endCol = formData.get('endCol') as string;

    if (extention && excelExtentions.includes(extention)) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const workbook = XLSX.read(buffer, {type: 'buffer'});

        const sheetName = workbook.SheetNames[0];
        const workSheet = workbook.Sheets[sheetName];
        
        const range = `${startCol}${startRow}:${endCol}${endRow}`;
        
        const json = XLSX.utils.sheet_to_json(workSheet, {
            range: range,
            header: 1,
        });

        const categorizedData = await Promise.all((json as any[][]).map(async (row: any[], index: number) => {
            if (index === 0) {
                return [...row, 'Category'];
            }
            
            const description = row[2] || '';
            const category = await askGemini(`get category of "${description}" in one word. Available categories are: Grocery, Transportation, Dine-in, Social, Education, Personal, Car and Misc.`);
            
            return [...row, category];
        }));

        return categorizedData;
    } else {
        return [];
    }
}