@@ .. @@
 import { parseCSVFile, parseExcelFile, ParsedData, ProductRow } from '../utils/csvParser';

-interface ExcelImportProps {
+interface OzonAnalysisProps {
   onBack: () => void;
 }
@@ .. @@
 }

-const ExcelImport: React.FC<ExcelImportProps> = ({ onBack }) => {
+const OzonAnalysis: React.FC<OzonAnalysisProps> = ({ onBack }) => {
   const [isDragging, setIsDragging] = useState(false);