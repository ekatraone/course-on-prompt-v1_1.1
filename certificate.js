require('dotenv').config("./env");
const getStream = require('get-stream')
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function createCertificate(name, course_name) {

    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
    });
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');
    ``
    doc.fontSize(10);

    doc.pipe(fs.createWriteStream('output.pdf'))

    doc.image('./assets/corners.png', -1, 0, { scale: 0.585 }, { fit: [doc.page.width, doc.page.height], align: 'center' })
    // doc.image('assets/Union.png', 35, 20, { fit: [200, 200], align: 'center' })

    doc
        .font('fonts/RozhaOne-Regular.ttf')
        .fontSize(60)
        .fill('#292929')
        .text('CERTIFICATE', 80, 30, { align: 'center' });

    doc
        .font('fonts/RozhaOne-Regular.ttf')
        .fontSize(35)
        .fill('#292929')
        .text('OF COMPLETION', 100, 105, { align: 'center' });

    doc
        .font('fonts/Rufina-Regular.ttf')
        .fontSize(23)
        .fill('#125951')
        .text('This certificate is awarded to', 100, 185, { align: 'center' });

    doc
        .font('fonts/Pinyon Script 400.ttf')
        .fontSize(65)
        .fill('#125951')
        .text(`${name}`, 0, 250, { align: 'center' });
    // width: 500,


    doc.image('assets/ekatra logo.png', 725, 490, { fit: [75, 75] })

    doc.lineWidth(2);

    // // Signatures
    ; const lineSize = 174;
    const signatureHeight = 500

    doc.fillAndStroke('#021c27');
    doc.strokeOpacity(1);

    const startLine1 = 100;
    const endLine1 = 300 + lineSize;
    doc
        .moveTo(200, 320)
        .lineTo(700, 320)
        .fillAndStroke('#125951');

    doc
        .font('fonts/Rufina-Regular.ttf')
        .fontSize(25)
        .fill('##292929s')
        .text('For Completing The Topic on ' + course_name, 140, 343, { align: 'center' });

    doc.image('assets/Sign.png', 560, 405, { fit: [120, 120] })

    doc
        .font('fonts/Rufina-Regular.ttf')
        .fontSize(20)
        .fill('##292929s')
        .text('Abhijeet K.', 490, 460, { align: 'center' });

    doc.lineWidth(2);

    // const startLine2 = endLine1 + 80;
    // const endLine2 = startLine2 + lineSize;
    doc
        .moveTo(560, 490)
        .lineTo(690, 490)
        .fillAndStroke('#125951');

    doc
        .font('fonts/Rufina-Regular.ttf')
        .fontSize(20)
        .fill('##292929s')
        .text('Founder, Ekatra', 490, 497, { align: 'center' });






    doc.end();
    return await getStream.buffer(doc)

}

// createCertificate("Sheniha", " Smart home technology")

module.exports = { createCertificate }