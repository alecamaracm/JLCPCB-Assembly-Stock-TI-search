var oldElementCount=1; //The first use is usually just the header of the table

browser.runtime.onMessage.addListener(request => {
    if(request=="start-stock"){
        StartStock();
    } 
}); 

function checkChangesInList(){
    var newElementCount = $("#tblResults").find("tr").not(".push-down-row").toArray().length;   

    if(oldElementCount!=newElementCount){
        console.log("newConut: "+newElementCount+", oldCount="+oldElementCount);
        StartStock();
        oldElementCount=newElementCount;
        setTimeout(checkChangesInList,5000); //Things just changed, have a 5 seconds cooldown at least
    }else{
        setTimeout(checkChangesInList,1000); //Check again for changes in 1 second
    }
}

setTimeout(checkChangesInList,2500); //First check, a little bit delayed


function StartStock(){
    console.log("Starting stock reload...");
    var count=0;
    $("#tblResults").find("tr").not(".push-down-row").toArray().forEach((partDOM)=>{

        let partNumber = partDOM.id;
        if(partNumber=="" || partNumber==undefined) return;


        count++;
        if(partDOM.classList.contains("push-down-row")) return;

       // console.log("Finding stock of "+partNumber);
    
        //Remove old stock info
        $(partDOM).find(".jlcpcba-stock").toArray().forEach((oldDOM)=>{oldDOM.remove()});
        let newDiv = document.createElement("div");
        newDiv.classList.add("jlcpcba-stock");
        newDiv.classList.add("loading");
        partDOM.firstElementChild.firstElementChild.insertBefore(newDiv,partDOM.firstElementChild.firstElementChild.firstElementChild);

        let firstRow = document.createElement("div");
        firstRow.classList.add("firstRow");
        newDiv.appendChild(firstRow);

        let firstRowLeft = document.createElement("div");
        firstRowLeft.classList.add("firstRowLeft");
        firstRow.appendChild(firstRowLeft);

        let newContent = document.createTextNode("JLCPCBA: ");
        firstRowLeft.appendChild(newContent);
        newContent = document.createTextNode("Loading "+partNumber+"...");
        firstRowLeft.appendChild(newContent);

        //console.log("Finding stock of "+partNumber);

        if(count < 100){
            fetch('https://jlcpcb.com/shoppingCart/smtGood/selectSmtComponentList', {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPage: 1,
                    pageSize: 25,
                    keyword: partNumber,
                    firstSortName: "",
                    secondeSortName: "",
                    searchSource: "search",
                    componentAttributes: []
                  })
            }).then(res => res.json())
            .then(res => {
               // console.log("Got stock data for part " +partNumber);
               // console.log(res);
                //Add stock info
                newDiv.classList.remove("loading");
                
                if(res.data.componentPageInfo.list.length>0){

                
    
                    const maxStockElement = res.data.componentPageInfo.list.reduce(function(prev, current) {
                        return (prev.stockCount > current.stockCount) ? prev : current
                    }) //returns object
    
                                    
                    if(maxStockElement.stockCount>0)
                    {
                        let secondRow = document.createElement("div");
                        secondRow.classList.add("secondRow");
                        newDiv.appendChild(secondRow);

                        newContent.textContent="In stock";
                        
                        if(maxStockElement.stockCount>100){
                            newDiv.classList.add("stock");
                        }else{
                            newDiv.classList.add("lowStock");
                        }    


                        let stockDiv=document.createElement("div");
                        stockDiv.innerHTML="Stock: "+maxStockElement.stockCount;
                        firstRow.appendChild(stockDiv);

                        let partTypeDiv = document.createElement("div");
                        partTypeDiv.classList.add("partType");

                        const basicPart = res.data.componentPageInfo.list.reduce(function(prev, current) {
                            return (current.componentLibraryType=="base") ? current : prev
                        }) //returns object                        
                        if(basicPart.componentLibraryType=="expand"){
                            partTypeDiv.classList.add("extended");
                            partTypeDiv.innerText="E";
                        }else{
                            partTypeDiv.classList.add("basic");
                            partTypeDiv.innerText="B";
                        }                        
                        firstRow.appendChild(partTypeDiv);

    
                        
                        const ordered = maxStockElement.componentPrices.sort(function(prev,next){
                            return prev.startNumber>next.startNumber;
                        });
                        ordered.forEach((priceItem)=>{
                            if(secondRow.children.length>=3) return;
                            let priceDiv=document.createElement("div");
                            priceDiv.innerHTML="<span class='priceAmount'>+"+priceItem.startNumber+"</span> - "+priceItem.productPrice+"$";
                            secondRow.appendChild(priceDiv);
                        });

                      

                
                    }
                    else
                    {
                        newDiv.classList.add("noStock");
                        newContent.textContent="No stock";
                    }
    
         
                }else{
                    newDiv.classList.add("notAssembled");
                    newContent.textContent="Not assembled";
                }
    
            });
        }else{
            newContent.textContent="- - - TOO MANY ITEMS - - -";
        }
        
        



    })
}

setTimeout(()=>{    
    var adNode=document.createElement("div");
    adNode.innerHTML=("JLCPCBA-Stock by Alejandro Cabrerizo is running. Press <span class='AChotkey'>Ctrl+Alt+J</span> to load the stock data for the parts shown.");
    adNode.classList.add("useNode");
    $(".rst-overflow-area")[0].parentElement.insertBefore(adNode,$(".rst-overflow-area")[0]);   
},3000);



