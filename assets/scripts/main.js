let newListValues;
let sanitizedList;
let text = "<th></th>";
let matrix = [];
let booleanMatrix = [];
let totalVotes = [];
let list = [];
let question;

let sumTotalVotes = 0;

let chooseRow;
let chooseColumn;

let lastRowChoice = 0;
let lastColumnChoice = 0;

let fifoRow; //pop[0], push[l-1];
let fifoColumn;

let totalRounds;
let idealAverage;

let sum = 0;

let choiceA_Rating;
let choiceB_Rating;
let choiceA_ExpectedScore;
let choiceB_ExpectedScore;
let choiceA_TotalVotes;
let choiceB_TotalVotes;
let choiceA_K;
let choiceB_K;

let choiceA_minus_choiceB;
let choiceB_minus_choiceA;
let percentageRemainingVotes;

let colorscale = ['#67001f', '#6c0521', '#700b23', '#751125', '#791627', '#7e1a29', '#821f2b', '#87232d', '#8c282f', '#902c31', '#953034', '#993436', '#9e3838', '#a23d3b', '#a6413d', '#ab453f', '#af4942', '#b34e45', '#b85247', '#bc564a', '#c05b4d', '#c45f4f', '#c86452', '#cc6855', '#d06d58', '#d4715b', '#d8765f', '#db7b62', '#df7f65', '#e28469', '#e5896c', '#e88e70', '#eb9374', '#ee9878', '#f19e7c', '#f3a380', '#f5a886', '#f6ae8d', '#f7b394', '#f8b99c', '#f9bfa3', '#fac4aa', '#fbcab2', '#fbcfba', '#fbd5c2', '#fbdaca', '#fbe0d2', '#fbe6db', '#faece4', '#f9f1ed', '#f7f7f7', '#eff3f5', '#e8eff4', '#e0ecf2', '#d8e8f0', '#d1e4ef', '#c9e0ed', '#c2dceb', '#bad9e9', '#b3d5e7', '#abd1e5', '#a3cde3', '#9bcae1', '#94c6de', '#8dc2dc', '#88bdda', '#83b9d7', '#7eb5d5', '#79b1d2', '#74accf', '#6fa8cc', '#6ba4c9', '#66a0c6', '#629bc3', '#5e97bf', '#5a93bc', '#568fb9', '#528bb5', '#4e86b2', '#4a82ae', '#467eab', '#437aa7', '#3f76a4', '#3c72a0', '#386e9d', '#356a99', '#326695', '#2e6292', '#2b5e8e', '#285a8a', '#255686', '#225283', '#1f4e7f', '#1c4a7b', '#194678', '#164374', '#133f70', '#0f3b6c', '#0c3768', '#083465', '#053061'];

let elo = [];

function readData() {
    console.log("readData called");
  
    // Does this browser support local storage?
    if (typeof (Storage) !== "undefined") {
        console.log("Browser supports local storage");
    
        if (window.localStorage.getItem('matrix')){

            let lastQuestion = window.localStorage.getItem('question');
            document.getElementById("question").value = lastQuestion;

            let lastList = window.localStorage.getItem('sanitized-list');
            document.getElementById("write-new-list").value = lastList;
            
            list = JSON.parse(window.localStorage.getItem('list'));
            matrix = JSON.parse(window.localStorage.getItem('matrix'));
            booleanMatrix = JSON.parse(window.localStorage.getItem('boolean-matrix'));
            elo = JSON.parse(window.localStorage.getItem('elo'));
            totalVotes = JSON.parse(window.localStorage.getItem('votes'));

            sumTotalVotes = JSON.parse(window.localStorage.getItem('sum-total-votes'));

            if (window.localStorage.getItem('sum-total-votes') == null){
                sumTotalVotes = 0;
            }

            createNewList();


        }

    } else {
      // Sorry! No Web Storage support..
      alert('This browser does NOT support local storage');
    }
  }
  



let form = document.getElementById("create-new-list");
function handleForm(event) { 
    event.preventDefault(); 
} 
form.addEventListener('submit', handleForm);

function sanitizeInputs(str){
    str = str.replace(/[^a-z0-9áéíóúñü \,-]/gim,"");
    return str.trim();
}

function sumArrays(array){
    sum = 0;
    for (let i = 0; i < array.length; i++){
        sum += array[i];
    }
    return sum;
}

function findK(votes, rating){
    let k;
    if ((votes <= 30) & (rating <= 6000)){
        k = 100;
    } else if ((votes >= 30) & (rating <= 6000)){
        k = 50;
    } else if ((votes >= 30) & (rating >= 6000)){
        k = 25
    };

    return k;
};

function getExpectedScore(primary, secondary){
    let difference = secondary - primary;
    let chances = 1/(1+10**((difference)/1000));
    return chances;
}


function shuffle(array){
    let flattenedArray = array.flat();
    let currentIndex = flattenedArray.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [flattenedArray[currentIndex], flattenedArray[randomIndex]] = [
        flattenedArray[randomIndex], flattenedArray[currentIndex]];
    }
  
    return flattenedArray;
}


function printMatrix(myArray){
    let result = "";

    result += '<table>'
    result += '<colgroup></colgroup>'
    result += '<colgroup></colgroup>'
    result += '<colgroup></colgroup>'

    for (let i=0; i<(myArray.length); i++) {
       result += '<colgroup class="shade"></colgroup>'
    };

    result +='<tr><th>NAME</th><th>RANK</th><th>ID</th>'

    for (let i=0; i<myArray.length; i++) {
        result += '<th scope="column" class="column-header">' + (i+1) + '</th>';
    };

    result += '</tr>'

    for (let i=0; i<myArray.length; i++) {
        result += "<tr>";
        result += '<td class="y-axis-label" scope="row">' + list[i] + '</td><td class="y-axis-elo" scope="row">' + Math.round(elo[i]) + '</td><td class="y-axis-label" scope="row">' + (i+1) + '</th>';
        for (let j=0; j<myArray[i].length; j++){
            
            result += '<td class="data-cell" style="background-color: ' + colorscale[Math.floor(booleanMatrix[i][j])] + '">'

           /*  if (booleanMatrix[i][j] === 50){
                result +=  '<td class="neutral">'
            } else if (booleanMatrix[i][j] > 50){
                result +=  '<td class="positive">' 
            } else if (booleanMatrix[i][j] < 50){
                result +=  '<td class="negative">' 
            } */
            result += Math.floor(booleanMatrix[i][j]) + '%<span class="tooltiptext">' + myArray[i][j] + ' (' + (booleanMatrix[i][j]).toFixed(2) + "%)</span></td>";
        }
        result += "</tr>";
    };



    result += "</table>"
    return result;
}

function createNewList(){
    newListValues = document.getElementById("write-new-list").value;
    sanitizedList = sanitizeInputs(newListValues);
    list = sanitizedList.split(",");

    if (list.length > 2){
        window.localStorage.setItem('sanitized-list', sanitizedList);

        window.localStorage.setItem('list', JSON.stringify(list));

        fifoRow = Array((list.length) - 2);
        fifoColumn = Array((list.length) - 2);

        totalRounds = ((list.length) * (list.length)) - (list.length);
        idealAverage = 1 / totalRounds;


        console.log(totalRounds);
        console.log((idealAverage)*100 + "%");


        document.getElementById("exercise").style.display = "block";
        document.getElementById("info").style.display = "none";

        //Create table rows, 1 for each list item + 1 for the labels
        if (!window.localStorage.getItem('matrix')){
            for (let i=0; i<list.length; i++) {
                matrix[i] = [];
                booleanMatrix[i] = []
                totalVotes[i] = []
                elo[i] = 1000;
                for (let j=0; j < list.length; j++){
                    matrix[i][j] = list[i] + " v. " + list[j];
                    booleanMatrix[i][j] = 50;
                    totalVotes[i][j] = 0;
                };
            };
        };
        //Create an equal amount of columns.
        //Black out the corners
        document.getElementById("list-item-matrix").innerHTML = printMatrix(matrix);
        document.getElementById("votes-needed").innerHTML = '<p class="not-ready">Votes Needed (Recommended): ' + sumTotalVotes + '/' + (list.length - 1)*(list.length/2) + '</p>';
        giveChoice();
    };
};

function giveChoice(){
    if (window.localStorage.getItem('question')){
        question = window.localStorage.getItem('question');
    } else {
        question = document.getElementById("question").value;
    }
    let sanitizedQuestion = sanitizeInputs(question);


    percentageRemainingVotes = sumTotalVotes / ( (list.length - 1)*(list.length/2));


    if (percentageRemainingVotes <= .999){
        document.getElementById("votes-needed").innerHTML = '<p class="not-ready">Votes Needed: ' + sumTotalVotes + '/' +  (list.length - 1)*(list.length/2) + '</p>';
    } else if (percentageRemainingVotes >= .999){
        document.getElementById("votes-needed").innerHTML = '<p class="ready">Total Votes: ' + sumTotalVotes + '</p>';
        document.getElementById("cool-graph").style.display = "block";

    }

    console.log(totalVotes)

    window.localStorage.setItem('question', sanitizedQuestion);
    // Drawing criteria:
    // 1. The two choices have to be unique (x cannot be compared to x)
    // 2. Of the two choices, one must not have been drawn in the prior round. (if the last round was between x & y, then this round cannot have both x or y as choices. It must be one or the other. )
    // 3. The pair must have been chosen less than frequently.

    do{
        do {
            chooseRow = Math.floor(Math.random() * list.length);
        } while (/* fifoRow.includes(chooseRow) */ chooseRow == lastRowChoice);


        do {
            chooseColumn =  Math.floor(Math.random() * list.length);
        } while (/* fifoRow.includes(chooseColumn) */ (chooseColumn == lastColumnChoice) || (chooseColumn == chooseRow));

    } while ((totalVotes[chooseColumn][chooseRow])/(sumTotalVotes*2) > idealAverage);


    lastRowChoice = chooseRow;
    lastColumnChoice = chooseColumn;

/* 
    fifoRow.shift();
    fifoRow.push(chooseRow);

    fifoRow.shift();
    fifoRow.push(chooseColumn); */

    console.log(fifoRow);



    document.getElementById("choices").innerHTML = '<h2 id="question-header">' + sanitizedQuestion + '?</h2>';
    document.getElementById("choices").innerHTML += '<div class="buttons-to-press"><input type="button" class="choice-button" onclick="option(' + chooseRow +', ' + chooseColumn +')" name="option1" id="option1" value="' + list[chooseRow] + '">' + '<input type="button" class="choice-button" onclick="option(' + chooseColumn +', ' + chooseRow +')"" name="option2" id="option2" value="' + list[chooseColumn] + '"></div>';


    choiceA_Rating = elo[chooseRow];
    choiceB_Rating = elo[chooseColumn];

/*     let x = choiceA_Rating - choiceB_Rating;
    let y = choiceB_Rating - choiceA_Rating; */

    choiceA_TotalVotes = sumArrays(totalVotes[chooseRow]);
    choiceB_TotalVotes = sumArrays(totalVotes[chooseColumn]);

    //Expected Score

  /*   choiceA_ExpectedScore = 1/(1+10**((y)/1000));
    choiceB_ExpectedScore = 1/(1+10**((x)/1000)); */


    choiceA_ExpectedScore = getExpectedScore(choiceA_Rating, choiceB_Rating);
    choiceB_ExpectedScore = getExpectedScore(choiceB_Rating, choiceA_Rating);



    choiceA_K = findK(choiceA_TotalVotes, choiceA_Rating);
    choiceB_K = findK(choiceB_TotalVotes, choiceB_Rating);

}




function option(chosen, rejected){


    



    //Calculating ELO: 
    // Step 1: Find the Expected Score
    // E(a) = 1 / 1 + 10 ^ ((Rating(b) - Rating(a))/400)
    // E(b) = 1 / 1 + 10 ^ ((Rating(a) - Rating(b))/400)

    // Step 2: Determine K-Factor
    // if ((totalVotes < 30) || (rating < 2400){ K = 40 };
    // if ((totalVotes > 30) || (rating < 2400){ K = 20 };
    // if ((totalVotes > 30) || (rating > 2400){ K = 10 };

    // Step 3: Play the game and get an outcome

    // Step 4: Based on the outcome (if "a" wins and "b" loses):
    // Rating(a) + K(1-E(a))
    // Rating(b) + K(0-E(b))


    if (elo[chooseRow] == elo[chosen]){
        elo[chosen] = choiceA_Rating + choiceA_K * (1 - choiceA_ExpectedScore);
        elo[rejected] = choiceB_Rating + choiceB_K * (0 - choiceB_ExpectedScore);
        if (elo[rejected]<= 0){
            elo[rejected] = 0;
        }
    }; 

    if (elo[chooseColumn] == elo[chosen]){
        elo[chosen] = choiceB_Rating + choiceB_K * (1 - choiceB_ExpectedScore);
        elo[rejected] = choiceA_Rating + choiceA_K * (0 - choiceA_ExpectedScore);
        if (elo[rejected]<= 0){
            elo[rejected] = 0;
        }
    }; 

   /*  let x = elo[chosen] - elo[rejected];
    let y = elo[rejected] - elo[chosen];

    let chosenChance = 1/(1+10**((y)/1000));
    let rejectedChance = 1/(1+10**((x)/1000));

    booleanMatrix[chosen][rejected] = (chosenChance * 100).toFixed(2); //Updated Changed
    booleanMatrix[rejected][chosen] = (rejectedChance * 100).toFixed(2); //Updated Chances */


    for (let i=0; i<matrix.length; i++){
        for (let j=0; j<matrix.length; j++){
            booleanMatrix[i][j] = (getExpectedScore(elo[i], elo[j])*100);
            console.log (booleanMatrix[i][j]);
        }
    }



    totalVotes[chosen][rejected] += 1;
    totalVotes[rejected][chosen] += 1;

    sumTotalVotes += 1;

    window.localStorage.setItem('sum-total-votes', sumTotalVotes);

    giveChoice();
    document.getElementById("list-item-matrix").innerHTML = printMatrix(matrix);

    window.localStorage.setItem('elo', JSON.stringify(elo));
    window.localStorage.setItem('votes', JSON.stringify(totalVotes));
    window.localStorage.setItem('matrix', JSON.stringify(matrix));
    window.localStorage.setItem('boolean-matrix', JSON.stringify(booleanMatrix));


/* 
    document.getElementById("results-list").innerHTML = " "

    for (let i=0; i<list.length; i++) {
        document.getElementById("results-list").innerHTML += '<li><b>' + list[i] + ': </b>' + Math.round(elo[i]) +'</li>';
    }; */

};

function restart(){
    window.localStorage.removeItem('elo');
    window.localStorage.removeItem('votes');
    window.localStorage.removeItem('matrix');
    window.localStorage.removeItem('question');
    window.localStorage.removeItem('boolean-matrix');
    window.localStorage.removeItem('sum-total-votes');


    matrix = [];
    booleanMatrix = [];
    totalVotes = [];
    list = [];
    elo = [];
    sumTotalVotes = 0;

    document.getElementById("exercise").style.display = "none";
    document.getElementById("info").style.display = "block";
    document.getElementById("cool-graph").style.display = "none";
}