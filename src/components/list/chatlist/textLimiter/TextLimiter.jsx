import React from 'react';

const TextLimiter = ({ text, limit }) => {
    const truncateText = (text, limit) => {
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    return (
        <p>{truncateText(text, limit)}</p>
    );
};

export default TextLimiter;
