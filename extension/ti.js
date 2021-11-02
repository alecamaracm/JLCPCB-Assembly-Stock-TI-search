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
        let newContent = document.createTextNode("Loading "+partNumber+"...");
        newDiv.appendChild(newContent);

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
                        newContent.textContent="Stock: "+maxStockElement.stockCount;
    
                        const maxPrice = maxStockElement.componentPrices.reduce(function(prev, current) {
                            return (prev.productPrice > current.productPrice) ? prev : current
                        }) //returns object
                        newContent.textContent+=" Price: "+maxPrice.productPrice;
    
                        if(maxStockElement.stockCount>10){
                            newDiv.classList.add("stock");
                        }else{
                            newDiv.classList.add("lowStock");
                        }                    
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



