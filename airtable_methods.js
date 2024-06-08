require('dotenv').config();
let axios = require('axios');

let Airtable = require('airtable');
const { post } = require('request');


let internal_course = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.internal_course_base); 

let base_student = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.student_base); // master_data_learners

let course_base = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.course_base); // alfred_course data

let alfred_base = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.alfred_base);
// this table is alfred cop

// console.log(base)

async function updateField(id, field_name, updatedValue) {

    base_student('Student').update([

        {
            "id": id,
            "fields": {
                [field_name]: updatedValue
            }
        }
    ], function (err, records) {
        if (err) {
            // throw new Error(err)
            console.log(err);
            // return;
        }

    });
}


async function getID(number) {

    console.log("airtable_methods: 42 -get ID  ")
    return new Promise(async function (resolve, reject) {
        const course_table = await base_student('Student').select({
            filterByFormula: "({Phone} = " + number + ")",
            view: "Grid view"
        }).all();

        course_table.forEach(function (record) {
            let id = record.id
            resolve(id)
            // reject("Error")
        })
    })

}

const totalDays = async (number) => {

    var course_tn = await findTable(number)
    const course_table = await course_base(course_tn).select({
        //filterByFormula: "({Phone} = " + number + ")",
        fields: ["Day"],
        view: "Grid view"
    }).all();
    return new Promise((resolve, reject) => {
        count = 0

        course_table.forEach(function (record) {
            count += 1

        })
        console.log(count)
        resolve(count)
        reject("Error")
    })
}

const findTable = async (number) => {

    // filterByFormula: "({Phone} = " + number + ")",
    const course_table = await base_student('Student').select({
        filterByFormula: "({Phone} = " + number + ")",
        view: "Grid view"
    }).all();
    // console.log("airtable_methods: 86"- course_table)
    return new Promise((resolve, reject) => {
        course_tn = ""
        course_table.forEach(function (record) {
            course_tn = record.get("Topic")

            resolve(course_tn)
            reject("error")

        })
    });
    //  console.log("airtable_methods: 97");
}


const findRecord = async (id) => {
    return new Promise((resolve, reject) => {
        base_student('Student').find(id, function (err, record) {
            if (err) { console.error(err); return; }
            field_name = "Question Responses"
            resolve(record.fields.field_name);
        });
    }
    )
}

const findQuesRecord = async (id) => {
    return new Promise((resolve, reject) => {
        base_student('Student').find(id, function (err, record) {
            if (err) { console.error(err); return; }

            resolve(record.fields.Responses);
        });
    }
    )
}

const findTitle = async (currentDay, module_no, number) => {
    let course_tn = await findTable(number)
    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    return new Promise((resolve, reject) => {
        records.forEach(function (record) {
            let title = record.get('Module ' + module_no + ' LTitle');
            let options = record.get('Module ' + module_no + ' List');
            if (title !== undefined) {
                console.log(title, options.split("\n"))
                resolve([title, options.split("\n")])

            }
            else {
                resolve([0, 0])
            }
        })
    })
}

const findInteractive = async (currentDay, module_no, number) => {

    var course_tn = await findTable(number)
    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    return new Promise((resolve, reject) => {
        records.forEach(function (record) {
            let body = record.get('Module ' + module_no + ' iBody');
            let buttons = record.get('Module ' + module_no + ' iButtons');
            if (body !== undefined) {
                resolve([body, buttons.split("\n")])
                reject("error")
            }
        })
    })
}

const findQuestion = async (currentDay, module_no, number) => {

    var course_tn = await findTable(number)
    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    return new Promise((resolve, reject) => {
        records.forEach(function (record) {
            let body = record.get('Module ' + module_no + ' Question');
            // let buttons = record.get('Module ' + module_no + ' iButtons');
            if (body !== undefined) {
                resolve(body)
                reject("error")
            }
        })
    })
}

const findLastMsg = async (number) => {

    var course_tn = await findTable(number)
    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    ); console.log("airtable_methods: 197 - course_tn --",  course_tn)
    return new Promise((resolve, reject) => {
        records.forEach(function (record) {
            let body = record.get('Last_Msg');
            // let buttons = record.get('Module ' + module_no + ' iButtons');
            if (body != undefined) {
                console.log("Last msg of " + number, body)
                resolve(body)
                // reject("error")
            }
            else {
                console.log("Last msg of " + number, body)
                resolve(undefined)
            }
        })
    })
}

const find_ContentField = async (field, currentDay, current_module, number) => {

    var course_tn = await findTable(number)
    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    return new Promise((resolve, reject) => {
        records.forEach(function (record) {
            let body = record.get(`Module ${current_module} ${field}`);

            if (body !== undefined) {
                // console.log("Feedback  " + number, body)
                feedback_options = [body]
                resolve(feedback_options[0].split("\n"))
                // reject("error")
            }
            else {
                console.log("Feedback  0")
                resolve(0)
            }
        })
    })
}

const findField = async (field, number) => {
    console.log("airtable_methods- 243 - find field")
    var course_tn = await findTable(number)
    const records = await base_student("Student").select({
        filterByFormula: "({Phone} =" + number + ")",
        view: "Grid view",

    }).all(
    );
    return new Promise((resolve, reject) => {
        records.forEach(function (record) {
            let body = record.get(field);
            // console.log("Last msg of " + number, body)

            // let buttons = record.get('Module ' + module_no + ' iButtons');
            if (body !== undefined) {
                // console.log("Last msg of " + number, body)
                resolve(body)
                // reject("error")
            }
            else {
                resolve(0)
            }
        })
    })
}

const findAns = async (currentDay, module_no, number) => {

    var course_tn = await findTable(number)
    const records = await course_base(course_tn).select({
        filterByFormula: "({Day} =" + currentDay + ")",
        view: "Grid view",

    }).all(
    );
    return new Promise((resolve, reject) => {
        records.forEach(function (record) {
            let body = record.get('Module ' + module_no + ' Ans');
            // let buttons = record.get('Module ' + module_no + ' iButtons');
            if (body !== undefined) {
                resolve(body)
                reject("error")
            }
        })
    })
}
//--------------------------------------------------------



async function createTable(course_name, course_fields) {
    let data = JSON.stringify({
        "description": course_name + "Course generated by COP",
        "fields": course_fields,
        "name": course_name
    });

    // console.log("data ", data)
    let config = {
        method: 'POST',

        url: `https://api.airtable.com/v0/meta/bases/${process.env.course_base}/tables`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data
    };

    table_id = axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data.id));
            console.log(typeof (response.data.id))
            return response.data.id
        })
        .catch((error) => {
            console.log("1. error ", error.response.data);
            if (error.response.data.error.type == "DUPLICATE_OR_EMPTY_FIELD_NAME") {
                console.log("DUPLICATE_OR_EMPTY_FIELD_NAME ", error.response.data.error)
                console.log(typeof (error.response.data))

            }
            else {
                console.log("2. error ", error.response.data);
                console.log(typeof (error.response.data))

            }
            return error.response.data
        });
    return table_id
}

async function updateCourseTable(course_name, new_table_name) {
    let data = JSON.stringify({
        "name": new_table_name
    });

    // console.log("data ", data)
    let config = {
        method: 'patch',

        url: `https://api.airtable.com/v0/meta/bases/${process.env.course_base}/tables/${course_name}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data
    };

    table_id = axios.request(config)
        .then((response) => {
            // console.log(JSON.stringify(response.data.id));
            // console.log(typeof (response.data.id))
            return response.status
        })
        .catch((error) => {
            console.log("1. update table error ", error.response.data);

            return error.response.data
        });
    return table_id
}

async function create_record(record_array, course_name) {
    let data = JSON.stringify({
        "records": record_array
    });

    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: `https://api.airtable.com/v0/${process.env.course_base}/${course_name}` ,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data
    };

    result = axios.request(config)
        .then((response) => {
            console.log(response.data);
            return response.status

        })
        .catch((error) => {
            console.log(error.response.data);
            return error.response.data
        });
    return result

}

async function create_student_record(senderID, name, topic) {
    let data = JSON.stringify({
        "records": [{
            fields: {
                'Phone': senderID,
                'Name': name,
                'Topic': topic,
                'Module Completed': 0,
                'Next Module': 1,
                'Day Completed': 0,
                'Next Day': 1,
                'Progress': 'In Progress'
            }
        }
        ]
    });

    let config = {
        method: 'post',
        url: `https://api.airtable.com/v0/${process.env.student_base}/${process.env.student_table}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data
    };

    result = axios.request(config)
        .then((response) => {
            console.log(response.data);
            return response.status

        })
        .catch((error) => {
            console.log(error.response.data);
            return error.response.data
        });
    return result

}

async function update_student_record(id) {
    let data = JSON.stringify({
        "records": [{
            fields: {
                'Module Completed': 0,
                'Next Module': 1,
                'Day Completed': 0,
                'Next Day': 1,
                'Progress': 'In Progress'
            }
        }
        ]
    });

    let config = {
        method: 'patch',
        url: `https://api.airtable.com/v0/${process.env.student_base}/${process.env.student_table}/${id}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data
    };

    result = axios.request(config)
        .then((response) => {
            console.log("Updated Student", response.data);
            return response.status

        })
        .catch((error) => {
            console.log("Student Update Error", error.response.data);
            return error.response.data
        });
    return result

}
async function create_course_record(senderID, name) {
    let data = JSON.stringify({
        "records": [{
            fields: {
                'Phone': senderID,
                'Name': name,
                'Topic': "",
                'Course Status': "Pending Approval",
                'Progress': "In Progress",
            }
        }
        ]
    });

    let config = {
        method: 'post',
        url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data
    };

    result = axios.request(config)
        .then((response) => {
            console.log(response.data);
            return response.status

        })
        .catch((error) => {
            console.log(error.response.data);
            return error.response.data
        });
    return result

}

async function find_student_record(senderID) {



    let config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.student_base}/Student?fields%5B%5D=Phone&filterByFormula=Phone%3D${senderID}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },


    };

    result = axios.request(config)
        .then((response) => {

            res = response.data
            console.log(res);
            return response.data.records

        })
        .catch((error) => {
            console.log(error);
            return error.response.data
        });
    return result

}

async function find_alfred_course_record(senderID) {



    let config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}?fields%5B%5D=Phone&fields%5B%5D=Last_Msg&filterByFormula=Phone%3D${senderID}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },


    };

    result = axios.request(config)
        .then((response) => {

            res = response.data
            // console.log("Alfred  Record ", res.records);
            return response.data.records

        })
        .catch((error) => {
            console.log("Alfred  Record Error", error);
            return error.response.data
        });
    return result

}

async function existingStudents(senderID) {
    let config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.alfred_waitlist_base}/tblAq61H84ablbDlW?fields%5B%5D=Phone&fields%5B%5D=Topic`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },


    };

    result = axios.request(config)
        .then((response) => {

            res = response.data
            // console.log("Existing Records ", res.records);
            return response.data.records

        })
        .catch((error) => {
            console.log(error);
            return error.response.data
        });
    return result

}

async function existingStudents_internal(senderID) {
    let config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.internal_course_base}/Student?fields%5B%5D=Phone&fields%5B%5D=Course&fields%5B%5D=Last_Msg&filterByFormula=Phone%3D${senderID}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },


    };

    result = axios.request(config)
        .then((response) => {

            res = response.data
            // console.log("Existing Records ", res.records);
            return response.data.records

        })
        .catch((error) => {
            console.log(error);
            return error.response.data
        });
    return result

}
async function update_internal_student_record(student_id, last_msg) {
    let data = JSON.stringify(
        {
            fields: {

                'Last_Msg': last_msg,
                'Source': "COP"

            }
        }

    );

    let config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/${process.env.internal_course_base}/Student/${student_id}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data

    };

    result = axios.request(config)
        .then((response) => {

            res = response.data.records
            // console.log(res.length);
            return response.status

        })
        .catch((error) => {
            console.log("1. ", error.response.data);
            return error.response.data
        });
    return result

}

async function update_student_record(student_id, course_name) {
    let data = JSON.stringify(
        {
            fields: {

                'Topic': course_name,
                'Module Completed': 0,
                'Next Module': 1,
                'Day Completed': 0,
                'Next Day': 1

            }
        }

    );

    let config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/${process.env.student_base}/${process.env.student_table}/${student_id}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data

    };

    result = axios.request(config)
        .then((response) => {

            res = response.data.records
            // console.log(res.length);
            return response.status

        })
        .catch((error) => {
            console.log(error.response.data);
            return error.response.data
        });
    return result

}

async function updateAlfredData(course_id, field_name, field_value) {
    let data = JSON.stringify(
        {
            fields: {

                [field_name]: field_value,

            }
        }

    );

    let config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}/${course_id}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data

    };

    result = axios.request(config)
        .then((response) => {

            res = response.data.records
            // console.log(res.length);
            return response.status

        })
        .catch((error) => {
            console.log(error.response.data);
            return error.response.data
        });
    return result

}

async function ListCourseFields(course_name) {


    let config = {
        method: 'GET',

        url: `https://api.airtable.com/v0/${process.env.course_base}/${course_name}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },


    };

    result = axios.request(config)
        .then((response) => {

            res = response.data.records

            console.log(res);
            return response.data

        })
        .catch((error) => {
            console.log("List record ", error.response.data);
            return error.response.data
        });
    return result

}

module.exports = {
    createTable, create_record, create_student_record, find_student_record, update_student_record, findTable,
    totalDays,
    updateField,
    findRecord,
    findTitle,
    findInteractive,
    findQuestion,
    findQuesRecord,
    getID,
    findLastMsg,
    findField,
    findAns,
    find_ContentField,
    existingStudents
    , find_alfred_course_record
    , create_course_record
    , updateAlfredData,
    updateCourseTable,
    ListCourseFields,
    existingStudents_internal,
    update_internal_student_record,

}