require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const Airtable = require('airtable');

async function update_record(record_array, course_name) {
    let data = JSON.stringify({
      "records": [
        {
          "id": "recBv4dcG2zq0LjWE",
          "fields": {
            "Day Topic voice": record_array
          }
        }
      ]
    });

    let config = {
        method: 'PATCH',
        maxBodyLength: Infinity,
        url: `https://api.airtable.com/v0/appESkhemFLj2ftxN/web%203`,
        // url: `https://api.airtable.com/v0/${process.env.course_base}/${course_name}` ,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        return response.status;
    } catch (error) {
        return error.response ? error.response.data : error.message;
    }
}

// Assuming the speech.mp3 is a file path and you want to read its content as part of the record_array
fs.readFile('./speech.wav', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    update_record([data], "web 3").then(result => {
        console.log(result);
    }).catch(error => {
        console.error('Error updating the record:', error);
    });
});
