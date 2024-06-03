export const linkify = (text) => {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const emailPattern = /(([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+))/ig;

    return text
        .replace(urlPattern, '<a href="$1" target="_blank">$1</a>')
        .replace(emailPattern, '<a href="mailto:$1">$1</a>');
};
