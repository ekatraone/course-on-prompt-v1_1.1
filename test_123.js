require('dotenv').config();
let axios = require('axios');

let Airtable = require('airtable');
const { post } = require('request');

async function create_record(record_array, course_name) {
    let data = JSON.stringify({
        "records": record_array
    });

    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        // url: `https://api.airtable.com/v0/${process.env.course_base}/` + course_name,
        url: `https://api.airtable.com/v0/${process.env.course_base}/${course_name}` ,
        headers: {
            'Authorization': `Bearer ${process.env.personal_access_token}`,
            'Content-Type': 'application/json',

        },
        data: data
    };

    result = axios.request(config)
        .then((response) => {
            //console.log(response.data);
            return response.status

        })
        .catch((error) => {
            //console.log(error.response.data);
            return error.response.data
        });
    return result

}


let module_details = [
    {
      fields: {
        Day: 1,
        'Module 1 Text': '🚀 Setting up React Environment 🛠️\n' +
          '\n' +
          "Get ready to dive into the world of React! Learn how to set up your development environment step-by-step. From installing Node.js and npm to creating your first React app, this module will equip you with the tools you need to start building dynamic web applications. Let's code together! 💻 #React #WebDevelopment #CodingJourney",
        'Module 2 Text': "🚀 Welcome to the exciting world of React components! Learn how to create reusable building blocks for your web applications. From functional to class components, dive into the fundamentals and unleash your creativity. 🌟 Let's build something amazing together! #React #Components #WebDevelopment",
        'Module 3 Text': "🚀 Dive into React with State and Props! Learn how to manage component data with State and pass data between components using Props. 🎯 Master these fundamental concepts to level up your React skills and become a pro at building dynamic and interactive web applications. Let's get started! 🌟 #React #StateAndProps #WebDevelopment"
      }
    },
    {
      fields: {
        Day: 2,
        'Module 1 Text': "🚀 Let's dive into Handling Events in React! Learn to add interactivity to your web applications by mastering event handling in React. From onClick to onChange, discover how to respond to user actions with ease. Get ready to level up your React skills and engage your audience like a pro! 🌟 #React #EventHandling #InteractiveWebApps",
        'Module 2 Text': "🚀 Dive into Conditional Rendering in React! Learn to show or hide elements based on conditions. 🎯 Master if-else statements and ternary operators to create dynamic user interfaces. 🌟 Engage your class with interactive examples and hands-on exercises. Let's level up your React skills together! 🌈 #React #ConditionalRendering #InteractiveLearning",
        'Module 3 Text': "📋 Let's dive into Lists and Keys in React! 🚀 Learn how to efficiently render lists of data and manage dynamic content. Master the importance of keys for optimizing performance and avoiding errors. 📝 Get ready to level up your React skills and impress your audience with well-organized and responsive applications! 🌟 #React #ListsAndKeys #WebDevelopment"
      }
    },
    {
      fields: {
        Day: 3,
        'Module 1 Text': "📝 Let's dive into Forms in React! Learn to create interactive forms that capture user input effectively. From basic form elements to form validation, this module will equip you with the skills to build dynamic web applications. Get ready to level up your React game and engage your audience with user-friendly forms! 🚀 #ReactForms #WebDevelopment #InteractiveLearning",
        'Module 2 Text': "🌟 Dive into React's Lifecycle Methods! Learn how to manage component behavior from creation to deletion. Understand componentDidMount, componentDidUpdate, and more. 🚀 Enhance your React skills and become a pro at handling component lifecycles! #React #LifecycleMethods #CodingJourney 🎓",
        'Module 3 Text': "🎓 Welcome to the world of React Hooks! 🚀 Learn how to supercharge your React components with Hooks in this engaging module. From useState to useEffect, you'll master the art of functional components and state management. 🌟 Get ready to level up your React skills and impress your peers! 💡 #ReactHooks #LearnByDoing"
      }
    }
  ];

//   //console.log( JSON.stringify({
//     "records": module_details
// }));
  
create_record(module_details, "Reactjs") 