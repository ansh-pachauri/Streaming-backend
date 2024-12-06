export const randomId = (length:number) => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < 3; j++) {
            result = result + letters[Math.floor(Math.random() * letters.length)];
        }
        if(i<length-1){
            result += "-";
        }
    }
    return result;
};
console.log(randomId(3));