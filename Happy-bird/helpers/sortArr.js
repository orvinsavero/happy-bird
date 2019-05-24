function sortArr(input, params, keys){
    let length = input.length;
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < (length - i - 1); j++) {
            if (params == 'big'){
                if (input[j][keys] < input[j+1][keys]) {
                    let tmp = input[j];
                    input[j] = input[j+1];
                    input[j+1] = tmp;
                }
            } else if (params == 'small'){
                if(input[j][keys] > input[j+1][keys]) {
                    let tmp = input[j];
                    input[j] = input[j+1];
                    input[j+1] = tmp;
                } 
            } 
        }
    }
    return input
}

module.exports = sortArr