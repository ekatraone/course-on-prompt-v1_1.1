# Follow these steps to run the files.

## Install dependencies 
```
npm i
```

## start the server and get the URL shown on the terminal

```
npm run dev
```

## Endpoints - 
### URL/ping
This GET API generates the modules and day-wise topics in a separate topic table

### URL/cop
Make a Post API  with a body to run get Daywise-modules. <br> JSON body -
``` 
{
    "waId" : ***, 
    "senderName": "***", 
    "text" : "Yes, Next"  
}
```
waID - This is your whatsapp number with countrycode <br>
prompt - <br>"Start day" to run the module for the first time.<br>
"Yes, Next" for other modules.<br>
"Finish day" to get certificate.<br>

### Changes required
Update the students table with Phone number, name , course details, day , module number. etc  <br>
Use your WhatsApp number to get messages to you. <br>
- You can consider this as an initiation as of now.


