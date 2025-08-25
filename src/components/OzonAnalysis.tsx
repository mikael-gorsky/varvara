import { parseCSVFile, parseExcelFile, ParsedData, ProductRow } from '../utils/csvParser';

interface OzonAnalysisProps {
  onBack: () => void;
}

const OzonAnalysis: React.FC<OzonAnalysisProps> = ({ onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
};