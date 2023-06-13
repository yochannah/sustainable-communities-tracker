const sortLabels = {
    "scale": "Project Size",
    "age": "Project Age"
};


const colForChart = {
    "Yes": {
        border: colors.solid.blue,
        bg: colors.faded.blue
    },
    "No": {
        border: colors.solid.yellow,
        bg: colors.faded.yellow
    },
    "No answer": {
        border: colors.solid.grey,
        bg: colors.faded.grey
    },
    "1-10": {
        border: colors.scaled.c30,
        bg: colors.scaled.c20
    },
    "10-20": {
        border: colors.scaled.c40,
        bg: colors.scaled.c30
    },
    "20-50": {
        border: colors.scaled.c50,
        bg: colors.scaled.c40
    },
    "50-100": {
        border: colors.scaled.c60,
        bg: colors.scaled.c50
    },
    "100-1000": {
        border: colors.scaled.c70,
        bg: colors.scaled.c60
    },
    "1000-10,000": {
        border: colors.scaled.c80,
        bg: colors.scaled.c70
    },
    "still active and being maintained/updated, me still contributing": {
        border: colors.solid.purple,
        bg: colors.faded.purple
    },
    "still active and being maintained/updated by my colleagues": {
        border: colors.solid.blue,
        bg: colors.faded.blue
    },
    "still active and being maintained/updated by my community": {
        border: colors.solid.green,
        bg: colors.faded.green
    },
    "finalised with occasional updates": {

        border: colors.solid.orange,
        bg: colors.faded.orange
    },
    "wrapped up and no longer active": {
        border: colors.solid.red,
        bg: colors.faded.red
    },
    "Other, please specify": {
        border: colors.solid.grey,
        bg: colors.faded.grey
    }
}

//never update this directly, please update by reference to colForChart.
//kthx 
const colForLegend = {
    scale: {
        "1-10": colForChart["1-10"],
        "10-20": colForChart["10-20"],
        "20-50": colForChart["20-50"],
        "50-100": colForChart["50-100"],
        "100-1000": colForChart["100-1000"],
        "1000-10,000": colForChart["1000-10,000"],
        "No answer": colForChart["No answer"]
    },
    bool: {
        "Yes": colForChart["Yes"],
        "No": colForChart["No"],
        "No answer": colForChart["No answer"]
    },
    activity: {
        "still active and being maintained/updated, me still contributing": colForChart["still active and being maintained/updated, me still contributing"],
        "still active and being maintained/updated by my colleagues": colForChart["still active and being maintained/updated by my colleagues"],
        "still active and being maintained/updated by my community": colForChart["still active and being maintained/updated by my community"],
        "finalised with occasional updates": colForChart["finalised with occasional updates"],
        "wrapped up and no longer active": colForChart["wrapped up and no longer active"],
        "Other, please specify": colForChart["Other, please specify"],
        "No answer": colForChart["No answer"]
    }
}

const orderOfThings = {
    scale: ["1-10", "10-20", "20-50", "50-100", "100-1000", "1000-10,000", "Other, please specify","No answer", "null"],
    bool : ["Yes", "No","No answer","null"],
    activity : [
        "still active and being maintained/updated, me still contributing",
        "still active and being maintained/updated by my colleagues",
        "still active and being maintained/updated by my community",
        "finalised with occasional updates",
        "wrapped up and no longer active",
        "Other, please specify",
        "No answer",
        "null"
    ],
}

const sortSurveyData = function (anArray, sortBy) {
    let response = anArray.sort(function (a, b) {
        if (sortBy == "age") {
            let ages = agesByProjName;
            let aDate = new Date(ages[a.ProjectPseudonym]);
            let bDate = new Date(ages[b.ProjectPseudonym]);
            if (aDate < bDate) {
                return -1;
            }
            if (bDate < aDate) {
                return 1;
            }
        }
        else if (sortBy == "scale") {
            let scale = orderOfThings.scale;
            aScaleIndex = scale.indexOf(a["project-user-count"]);
            bScaleIndex = scale.indexOf(b["project-user-count"]);

            //handle nulls
            if (!aScaleIndex && bScaleIndex) {
                return 1; //b is "bigger"
            }
            if (!bScaleIndex && aScaleIndex) {
                return -1; //a is "bigger" 
            }
            //normal non-null sort
            if (aScaleIndex > bScaleIndex) {
                return -1;
            }
            if (bScaleIndex > aScaleIndex) {
                return 1;
            }
        } else if (sortBy == "orderedRowName") {
            //this is for when the row has a specific orderr, but it's not alphabetic.
            blah;
        } else {
            if (a[sortBy] < b[sortBy]) {
                return -1;
            }
            if (b[sortBy] < a[sortBy]) {
                return 1;
            }
        }

        //if all else failed, they're equal: 
        return 0;
    });
    return response;
}