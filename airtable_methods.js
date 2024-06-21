require('dotenv').config();
let axios = require('axios');

let Airtable = require('airtable');
const { post } = require('request');


let internal_course = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.internal_course_base); 

let base_student = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.student_base); // master_data_learners

let course_base = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.course_base); // alfred_course data

let alfred_base = new Airtable({ apiKey: process.env.airtable_api }).base(process.env.alfred_base);
// this table is alfred cop

// //console.log(base)

async function updateField(id, field_name, updatedValue) {
    try {
        const records = await base_student('Student').update([
            {
                id,
                fields: {
                    [field_name]: updatedValue
                }
            }
        ]);
        return records;
    } catch (error) {
        console.error("Error updating field:", error);
        throw error;
    }
}



async function getID(number) {
  console.log("airtable_methods: 39 -get ID");
  try {
      const course_table = await base_student('Student').select({
          filterByFormula: `({Phone} = "${number}")`,
          view: "Grid view"
      }).all();

      if (course_table.length === 0) {
          throw new Error("No records found");
      }

      const id = course_table[0].id;
      return id;
  } catch (error) {
      console.error("Error:", error);
      throw new Error("Error retrieving ID");
  }
}

const totalDays = async (number) => {
  try {
      const course_tn = await findTable(number);
      const course_table = await course_base(course_tn).select({
          fields: ["Day"],
          view: "Grid view"
      }).all();

      const count = course_table.length;
      console.log(count);
      return count;
  } catch (error) {
      console.error("Error:", error);
      throw new Error("Error calculating total days");
  }
};


const findTable = async (number) => {
  try {
      const course_table = await base_student('Student').select({
          filterByFormula: `({Phone} = "${number}")`,
          view: "Grid view"
      }).all();

      if (course_table.length === 0) {
          throw new Error("No records found");
      }

      const course_tn = course_table[0].get("Topic");
      return course_tn;
  } catch (error) {
      console.error("Error:", error);
      throw new Error("Error retrieving table");
  }
};


const findRecord = async (id) => {
  try {
      const record = await base_student('Student').find(id);
      const fieldName = "Question Responses";
      return record.fields[fieldName];
  } catch (err) {
      console.error("Error:", err);
      throw new Error("Error retrieving record");
  }
};


const findQuesRecord = async (id) => {
  try {
      const record = await base_student('Student').find(id);
      return record.fields.Responses;
  } catch (err) {
      console.error("Error:", err);
      throw new Error("Error retrieving record");
  }
};


const findTitle = async (currentDay, module_no, number) => {
  try {
      const course_tn = await findTable(number);
      const records = await course_base(course_tn).select({
          filterByFormula: `({Day} = ${currentDay})`,
          view: "Grid view"
      }).all();

      for (const record of records) {
          const title = record.get(`Module ${module_no} LTitle`);
          const options = record.get(`Module ${module_no} List`);
          if (title !== undefined) {
              console.log(title, options.split("\n"));
              return [title, options.split("\n")];
          }
      }
      return [0, 0];
  } catch (error) {
      console.error("Error:", error);
      throw new Error("Error finding title");
  }
};


const findInteractive = async (currentDay, module_no, number) => {
  try {
      const course_tn = await findTable(number);
      const records = await course_base(course_tn).select({
          filterByFormula: `({Day} = ${currentDay})`,
          view: "Grid view"
      }).all();

      for (const record of records) {
          const body = record.get(`Module ${module_no} iBody`);
          const buttons = record.get(`Module ${module_no} iButtons`);
          if (body !== undefined) {
              return [body, buttons.split("\n")];
          }
      }
      return [0, []]; // Return default values if no interactive content found
  } catch (error) {
      console.error("Error:", error);
      throw new Error("Error finding interactive content");
  }
};


const findQuestion = async (currentDay, module_no, number) => {
  try {
      const course_tn = await findTable(number);
      const records = await course_base(course_tn).select({
          filterByFormula: `({Day} = ${currentDay})`,
          view: "Grid view"
      }).all();

      for (const record of records) {
          const body = record.get(`Module ${module_no} Question`);
          if (body !== undefined) {
              return body;
          }
      }
      return null; // Return null if no question found
  } catch (error) {
      console.error("Error:", error);
      throw new Error("Error finding question");
  }
};


async function findLastMsg(number) {
    try {
      const course_tn = await findTable(number);
      const records = await base_student("Student").select({
        filterByFormula: `({Phone} = ${number})`,
        view: "Grid view",
      }).all();
  
      return new Promise((resolve, reject) => {
        records.forEach((record) => {
          const body = record.get("Last_Msg");
          if (body !== undefined) {
            //console.log("Last msg of " + number, body);
            resolve(body);
          } else {
            //console.log("Last msg of " + number, body);
            resolve(undefined);
          }
        });
      });
    } catch (error) {
      console.error("Error finding last message:", error);
      return error.response.data;
    }
}
  

async function find_ContentField(field, currentDay, current_module, number) {
    try {
      const course_tn = await findTable(number);
      const records = await course_base(course_tn).select({
        filterByFormula: `({Day} = ${currentDay})`,
        view: 'Grid view',
      }).all();
  
      return new Promise((resolve, reject) => {
        records.forEach((record) => {
          const body = record.get(`Module ${current_module} ${field}`);
          if (body !== undefined) {
            const feedback_options = [body];
            resolve(feedback_options[0].split('\n'));
          } else {
            //console.log('Feedback 0');
            resolve(0);
          }
        });
      });
    } catch (error) {
      console.error('Error finding content field:', error);
      return error.response.data;
    }
}
  
async function findField(field, number) {
    try {
      //console.log('airtable_methods- 243 - find field');
      const course_tn = await findTable(number);
      const records = await base_student('Student').select({
        filterByFormula: `({Phone} = ${number})`,
        view: 'Grid view',
      }).all();
  
      return new Promise((resolve, reject) => {
        records.forEach((record) => {
          const body = record.get(field);
          if (body !== undefined) {
            resolve(body);
          } else {
            resolve(0);
          }
        });
      });
    } catch (error) {
      console.error('Error finding field:', error);
      return error.response.data;
    }
}
  

async function findAns(currentDay, module_no, number) {
    try {
      const course_tn = await findTable(number);
      const records = await course_base(course_tn).select({
        filterByFormula: `({Day} = ${currentDay})`,
        view: 'Grid view',
      }).all();
  
      return new Promise((resolve, reject) => {
        records.forEach((record) => {
          const body = record.get(`Module ${module_no} Ans`);
          if (body !== undefined) {
            resolve(body);
            reject("error");
          }
        });
      });
    } catch (error) {
      console.error('Error finding answer:', error);
      return error.response.data;
    }
}
  
//--------------------------------------------------------


async function createTable(course_name, course_fields) {
    try {
      const data = JSON.stringify({
        description: `${course_name} Course generated by COP`,
        fields: course_fields,
        name: course_name,
      });
  
      const config = {
        method: 'POST',
        url: `https://api.airtable.com/v0/meta/bases/${process.env.course_base}/tables`,
        headers: {
          Authorization: `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Table Created:", response.data);
      return response.data.id;
    } catch (error) {
      console.error('Error creating table:', error);
      if (error.response.data.error.type === 'DUPLICATE_OR_EMPTY_FIELD_NAME') {
        //console.log('DUPLICATE_OR_EMPTY_FIELD_NAME', error.response.data.error);
      } else {
        //console.log('Error:', error.response.data);
      }
      return error.response.data;
    }
}
  


async function updateCourseTable(course_name, new_table_name) {
    try {
      const data = JSON.stringify({
        name: new_table_name,
      });
  
      const config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/meta/bases/${process.env.course_base}/tables/${course_name}`,
        headers: {
          Authorization: `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Table Updated:", response.data);
      return response.status;
    } catch (error) {
      console.error('Error updating table:', error);
      return error.response.data;
    }
}
  


async function create_record(record_array, course_name) {
    try {
      const data = JSON.stringify({
        records: record_array,
      });
  
      const config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: `https://api.airtable.com/v0/${process.env.course_base}/${course_name}`,
        headers: {
          Authorization: `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Course Record Created:", response.data);
      return response.status;
    } catch (error) {
      console.error('Error creating course record:', error);
      return error.response.data;
    }
}
  

async function create_student_record(senderID, name, topic) {
    try {
      const data = JSON.stringify({
        records: [{
          fields: {
            Phone: senderID,
            Name: name,
            Topic: topic,
            'Module Completed': 0,
            'Next Module': 1,
            'Day Completed': 0,
            'Next Day': 1,
            Progress: 'In Progress',
          },
        }],
      });
  
      const config = {
        method: 'POST',
        url: `https://api.airtable.com/v0/${process.env.student_base}/${process.env.student_table}`,
        headers: {
          Authorization: `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Student Record Created:", response.data);
      return response.status;
    } catch (error) {
      console.error('Error creating student record:', error);
      return error.response.data;
    }
}
  


async function update_student_record(id) {
    try {
      const data = JSON.stringify({
        records: [{
          fields: {
            'Module Completed': 0,
            'Next Module': 1,
            'Day Completed': 0,
            'Next Day': 1,
            Progress: 'In Progress',
          },
        }],
      });
  
      const config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/${process.env.student_base}/${process.env.student_table}/${id}`,
        headers: {
          Authorization: `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Student Record Updated:", response.data);
      return response.status;
    } catch (error) {
      console.error('Error updating student record:', error);
      return error.response.data;
    }
}
  


async function create_course_record(senderID, name) {
    try {
      const data = JSON.stringify({
        records: [{
          fields: {
            Phone: senderID,
            Name: name,
            Topic: "",
            "Course Status": "Pending Approval",
            Progress: "In Progress",
          },
        }],
      });
  
      const config = {
        method: 'POST',
        url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}`,
        headers: {
          Authorization: `Bearer ${process.env.personal_access_token}`,
          "Content-Type": "application/json",
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Course Record Created:", response.data);
      return response.status;
    } catch (error) {
      console.error("Error creating course record:", error);
      return error.response.data;
    }
}
  

async function find_student_record(senderID) {
    try {
      const config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.student_base}/Student?fields%5B%5D=Phone&filterByFormula=AND({Phone}="${senderID}", NOT({Progress}="Completed"))`,
        headers: {
          'Authorization': `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
      };
  
      const response = await axios.request(config);
      const records = response.data.records;
      //console.log(records);
      return records;
    } catch (error) {
      console.error('Error:', error);
      return error.response.data;
    }
  }
  

  async function find_alfred_course_record(senderID) {
    try {
      const config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}?fields%5B%5D=Phone&fields%5B%5D=Last_Msg&filterByFormula=Phone%3D${senderID}`,
        headers: {
          'Authorization': `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
      };
  
      const response = await axios.request(config);
      const records = response.data.records;
      // //console.log("Alfred Record ", records);
      return records;
    } catch (error) {
      console.error('Alfred Record Error:', error);
      return error.response.data;
    }
  }
  

  async function existingStudents(senderID) {
    try {
      const config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.alfred_waitlist_base}/tblAq61H84ablbDlW?fields%5B%5D=Phone&fields%5B%5D=Topic`,
        headers: {
          'Authorization': `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
      };
  
      const response = await axios.request(config);
      const records = response.data.records;
      // //console.log("Existing Records:", records);
      return records;
    } catch (error) {
      console.error('Error fetching existing student records:', error);
      return error.response.data;
    }
}
  

async function existingStudents_internal(senderID) {
    try {
      const config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.internal_course_base}/Student?fields%5B%5D=Phone&fields%5B%5D=Course&fields%5B%5D=Last_Msg&filterByFormula=Phone%3D${senderID}`,
        headers: {
          'Authorization': `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
      };
  
      const response = await axios.request(config);
      const records = response.data.records;
      // //console.log("Existing Records:", records);
      return records;
    } catch (error) {
      console.error('Error fetching existing student records:', error);
      return error.response.data;
    }
}
  

async function update_internal_student_record(student_id, last_msg) {
    try {
      const data = JSON.stringify({
        fields: {
          'Last_Msg': last_msg,
          'Source': 'COP',
        },
      });
  
      const config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/${process.env.internal_course_base}/Student/${student_id}`,
        headers: {
          'Authorization': `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Internal Student Record Updated:", response.data);
      return response.status;
    } catch (error) {
      console.error('Error updating internal student record:', error);
      return error.response.data;
    }
}
  


async function update_student_record(student_id, course_name) {
    try {
      const data = JSON.stringify({
        fields: {
          'Topic': course_name,
          'Module Completed': 0,
          'Next Module': 1,
          'Day Completed': 0,
          'Next Day': 1,
        },
      });
  
      const config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/${process.env.student_base}/${process.env.student_table}/${student_id}`,
        headers: {
          'Authorization': `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
        data: data,
      };
  
      const response = await axios.request(config);
      // //console.log("Student Record Updated:", response.data);
      return response.status;
    } catch (error) {
      console.error('Error updating student record:', error);
      return error.response.data;
    }
}
  


async function updateAlfredData(course_id, field_name, field_value) {
    try {
        const data = JSON.stringify({
        fields: {
            [field_name]: field_value,
        },
        });

        const config = {
        method: 'PATCH',
        url: `https://api.airtable.com/v0/${process.env.alfred_base}/${process.env.alfred_table}/${course_id}`,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',
        },
        data: data,
        };

        const response = await axios.request(config);
        // //console.log("Alfred Record Updated:", response.data);
        return response.status;
    } catch (error) {
        console.error('Error updating Alfred data:', error);
        return error.response.data;
    }
}
  

async function ListCourseFields(course_name) {
    try {
      const config = {
        method: 'GET',
        url: `https://api.airtable.com/v0/${process.env.course_base}/${course_name}`,
        headers: {
          'Authorization': `Bearer ${process.env.personal_access_token}`,
          'Content-Type': 'application/json',
        },
      };
  
      const response = await axios.request(config);
      const records = response.data.records;
      //console.log(records);
      return response.data;
    } catch (error) {
      console.error('List record error:', error);
      return error.response.data;
    }
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