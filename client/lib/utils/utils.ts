const randomuser = () => ['boarofWar', 'boarCoder', 'codeSmell', 'sniffNation'][Math.floor(Math.random() * 4)];
const randomNum = () => Math.random().toString(36).slice(2);
/** select a random user name from a list */
export const getRandomUserName = () => `${randomuser()}_${randomNum()}🐗`;
