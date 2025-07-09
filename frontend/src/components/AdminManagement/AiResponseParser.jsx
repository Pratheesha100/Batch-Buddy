import React from 'react';

// Simple function to convert markdown-like bold (**text**) to <strong>
const renderBoldText = (line) => {
  // Use split and map to handle multiple bold sections in one line
  const parts = line.split(/(\*\*.*?\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    } 
    // Handle potential partial bold markers if needed, otherwise return text
    // Basic handling: just return the part if it's not fully bold
    return part;
  });
};

function AiResponseParser({ text }) {
  if (!text) return null;

  const lines = text.split('\n').filter(line => line.trim() !== ''); // Split and remove empty lines
  const elements = [];
  let currentListItems = [];

  const pushList = () => {
    if (currentListItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`}>{currentListItems}</ul>);
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('## ')) {
      pushList(); // Finalize any previous list
      elements.push(<h2 key={index}>{renderBoldText(trimmedLine.substring(3))}</h2>);
    } else if (trimmedLine.startsWith('### ')) {
       pushList(); // Finalize any previous list
       elements.push(<h3 key={index}>{renderBoldText(trimmedLine.substring(4))}</h3>);
    } else if (trimmedLine.startsWith('* ')) {
      // Start or continue a list
      const listItemText = trimmedLine.substring(2);
      currentListItems.push(<li key={index}>{renderBoldText(listItemText)}</li>);
    } else {
      // Regular paragraph (or end of list)
      pushList(); // Finalize any previous list
      elements.push(<p key={index}>{renderBoldText(trimmedLine)}</p>);
    }
  });

  // Push any remaining list items at the end
  pushList();

  return <>{elements}</>; // Render the array of JSX elements
}

export default AiResponseParser; 