import { useState } from 'react';
import './App.css';
import CopyButton from './CopyButton';

type ShortenUrlDto = {
  url: string;
  originalUrl: string;
};

const App = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [url, setUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [copyMessage, setCopyMessage] = useState('Copy');
  const [isCopied, setIsCopied] = useState(false);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleShorten = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 400 && errorData.message) {
          alert(errorData.message[0]);
        } else {
          throw new Error('An error occurred while shortening the URL');
        }
        return;
      }

      const data = (await response.json()) as ShortenUrlDto;
      setShortUrl(data.url);
      setCopyMessage('Copy');
      setIsCopied(false);
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while shortening the URL');
    }
  };

  return (
    <div className="App">
      <h1>URL shortener</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Enter the URL"
          value={url}
          onChange={handleUrlChange}
        />
        <abbr title="Shorten the URL">
          <button onClick={handleShorten} disabled={!url}>
            Shorten
          </button>
        </abbr>
      </div>
      <div className="result">
        <input
          type="text"
          value={shortUrl}
          readOnly
          placeholder="There will be a short link"
        />
        <CopyButton
          copyMessage={copyMessage}
          setCopyMessage={setCopyMessage}
          isCopied={isCopied}
          setIsCopied={setIsCopied}
          textToCopy={shortUrl}
        />
      </div>
    </div>
  );
};

export default App;
