import './CopyButton.css';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';

interface CopyMessageProps {
  copyMessage: string;
  setCopyMessage: React.Dispatch<React.SetStateAction<string>>;
  isCopied: boolean;
  setIsCopied: React.Dispatch<React.SetStateAction<boolean>>;
  textToCopy: string;
}

const CopyButton = ({
  copyMessage,
  setCopyMessage,
  isCopied,
  setIsCopied,
  textToCopy,
}: CopyMessageProps) => {
  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyMessage('Copied!');
        setIsCopied(true);
      })
      .catch((err) => console.error('Could not copy text: ', err));
  };

  return (
    <abbr title="Copy to clipboard">
      <button
        className={`copy ${isCopied ? 'copied' : ''}`}
        onClick={() => handleCopy(textToCopy)}
        disabled={!textToCopy}
      >
        <DocumentDuplicateIcon />
        {copyMessage}
      </button>
    </abbr>
  );
};

export default CopyButton;
