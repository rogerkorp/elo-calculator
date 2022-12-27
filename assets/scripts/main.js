let newListValues;
let sanitizedList;
let text = "<th></th>";
let matrix = [];
let booleanMatrix = [];
let totalVotes = [];
let list = [];

let sumTotalVotes = 0;

let chooseRow;
let chooseColumn;
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

let elo = [];

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

    for (let i=0; i<myArray.length; i++) {
        result += "<tr>";
        result += '<th scope="row">' + list[i] + ' (' + Math.round(elo[i]) + ')</th>';
        for (let j=0; j<myArray[i].length; j++){
            if (booleanMatrix[i][j] === 50){
                result +=  '<td class="neutral">'
            } else if (booleanMatrix[i][j] > 50){
                result +=  '<td class="positive">' 
            } else if (booleanMatrix[i][j] < 50){
                result +=  '<td class="negative">' 
            }
            result += myArray[i][j] + ' (' + booleanMatrix[i][j] + "%)</td>";
        }
        result += "</tr>";
    };
    result += "</table>"
      
    result += "<td></td>";

    for(let i=0; i<list.length; i++){
        result += '<th scope="col">' + list[i] + '</th>';
    }

    result += "<td></td>";

      return result;
}

function createNewList(){
    newListValues = document.getElementById("write-new-list").value;
    sanitizedList = sanitizeInputs(newListValues);
    list = sanitizedList.split(",");
    document.getElementById("exercise").style.display = "block";

    //Create table rows, 1 for each list item + 1 for the labels
    for (let i=0; i<list.length; i++) {
        matrix[i] = [];
        booleanMatrix[i] = []
        totalVotes[i] = []
        elo[i] = 1000;
        for (let j=0; j < list.length; j++){
            matrix[i][j] = list[i] + " v. " + list[j];
            booleanMatrix[i][j] = 50;
            totalVotes[i][j] = 0;
        }
      };

    //Create an equal amount of columns.
    //Black out the corners
    document.getElementById("list-item-matrix").innerHTML = printMatrix(matrix);
    document.getElementById("votes-needed").innerHTML = 'Votes Needed (Recommended): ' + sumTotalVotes + '/' + (list.length)*15;
    giveChoice();
};

function giveChoice(){
    let question = document.getElementById("question").value;
    let sanitizedQuestion = sanitizeInputs(question);

    let chooseRow = Math.floor(Math.random() * list.length);

    do {
        chooseColumn =  Math.floor(Math.random() * list.length);
    } while (chooseRow == chooseColumn);


   

    document.getElementById("choices").innerHTML = '<h2>' + sanitizedQuestion + '?</h2>'
    document.getElementById("choices").innerHTML += '<p>' + list[chooseRow] + ' or ' + list[chooseColumn] + '</p>'
    document.getElementById("choices").innerHTML += '<form name="make-a-choice">'
    document.getElementById("choices").innerHTML += '<input type="button" onclick="option(' + chooseRow +', ' + chooseColumn +')" name="option1" id="option1" value="' + list[chooseRow] + '">'
    document.getElementById("choices").innerHTML += '<input type="button" onclick="option(' + chooseColumn +', ' + chooseRow +')"" name="option2" id="option2" value="' + list[chooseColumn] + '"></form>'


    choiceA_Rating = elo[chooseRow];
    choiceB_Rating = elo[chooseColumn];

    let x = choiceA_Rating - choiceB_Rating;
    let y = choiceB_Rating - choiceA_Rating;

    console.log(x);
    console.log(y);

    choiceA_TotalVotes = sumArrays(totalVotes[chooseRow]);
    choiceB_TotalVotes = sumArrays(totalVotes[chooseColumn]);

    //Expected Score

    choiceA_ExpectedScore = 1/(1+10**((y)/1000));
    choiceB_ExpectedScore = 1/(1+10**((x)/1000));

    choiceA_K = findK(choiceA_TotalVotes, choiceA_Rating);
    choiceB_K = findK(choiceB_TotalVotes, choiceB_Rating);

}


function option(chosen, rejected){


    


    console.log('Choice A ELO: ' + choiceA_Rating);
    console.log('Choice A Expected Score: ' + choiceA_ExpectedScore);
    console.log('Choice A Total Votes: ' + choiceA_TotalVotes);
    console.log('Choice A K-Factor: ' + choiceA_K);
    console.log(' ');
    console.log('Choice B ELO: ' + choiceB_Rating);
    console.log('Choice B Expected Score: ' + choiceB_ExpectedScore);
    console.log('Choice B Total Votes: ' + choiceB_TotalVotes);
    console.log('Choice B K-Factor: ' + choiceB_K);



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
    } 

    if (elo[chooseColumn] == elo[chosen]){
        elo[chosen] = choiceB_Rating + choiceB_K * (1 - choiceB_ExpectedScore);
        elo[rejected] = choiceA_Rating + choiceA_K * (0 - choiceA_ExpectedScore);
        if (elo[rejected]<= 0){
            elo[rejected] = 0;
        }
    } 

    let x = elo[chosen] - elo[rejected];
    let y = elo[rejected] - elo[chosen];

    let chosenChance = 1/(1+10**((y)/1000));
    let rejectedChance = 1/(1+10**((x)/1000));

    booleanMatrix[chosen][rejected] = (chosenChance * 100).toFixed(2); //Updated Changed
    booleanMatrix[rejected][chosen] = (rejectedChance * 100).toFixed(2); //Updated Chances

    totalVotes[chosen][rejected] += 1;
    totalVotes[rejected][chosen] += 1;

    sumTotalVotes += 1;

    
    document.getElementById("votes-needed").innerHTML = 'Votes Needed (Recommended): ' + sumTotalVotes + '/' + (list.length)*15;

    giveChoice();
    document.getElementById("list-item-matrix").innerHTML = printMatrix(matrix);

    console.log(elo);

    document.getElementById("results-list").innerHTML = " "

    for (let i=0; i<list.length; i++) {
        document.getElementById("results-list").innerHTML += '<li><b>' + list[i] + ': </b>' + Math.round(elo[i]) +'</li>';
    };

};