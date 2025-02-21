async function getData(url){
    return await fetch(url)
}

async function convertData(url,ignoreRules = {firstRow:0,rows:0}) {
    const data = await getData(url)
    const text = await data.text()
    const rows = text.split('\n')
    const data2 = rows.map(row => row.split(','))
    if (ignoreRules.firstRow > 0){
            //remove items from the beginning of the array 
            //up to the number of ignoreRules.firstRow
            data2[0].splice(0,ignoreRules.firstRow)
        
    }
    if (ignoreRules.rows > 0){
        //remove rows from the beginning of the array 
        //up to the number of ignoreRules.rows
        for(const i in data2){
            if (i ==0){ //Skip the first row as it has been processed above
                continue;
            }

            //remove items from the beginning of the array 
            //up to the number of ignoreRules.firstRow
            data2[i].splice(0,ignoreRules.rows)
        }
    }
    for (const item of data2){
        item[item.length - 1] = item[item.length - 1].replace('\r', '')
        //Remove '"' 
        for (const i in item){
            item[i] = item[i].replace(/"/g, '')
        }
    }
    return data2
}

export { convertData }