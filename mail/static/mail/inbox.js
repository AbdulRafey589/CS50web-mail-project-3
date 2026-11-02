document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', sending_emails);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-page').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-page').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails =>{


        console.log(emails);
        emails.forEach( email =>
        {
          console.log(email.sender);
          console.log(email.read);
        console.log(email.subject);
        const element = document.createElement('div');
        element.classList.add("email-box");




        element.innerHTML = `
        <p class="email-sender">${email.sender}</p>
        <p class="email-subject">${email.subject}</p>
        <p class="email-timestamp">${email.timestamp}</p>`;
    //changing the color of the read email
    element.addEventListener('click', () => {
    fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })

    .then(response => {
        if (response.ok) {
            element.style.background = 'rgb(211, 211, 211)';
        }

    });
    fetch(`/emails/${email.id}`)
        .then(response => response.json())
        .then(email => {

            document.querySelector('#emails-page').innerHTML = '';
            document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#emails-page').style.display = 'block';
           const page = document.createElement('div');
           const button = document.createElement('button')
           const reply = document.createElement('button')
           reply.className = 'btn btn-sm btn-outline-primary'
           button.className = 'btn btn-sm btn-outline-primary'
           let check = '';
           if(mailbox === "inbox"){
              button.textContent = 'Archive';
              reply.textContent = 'Reply';
              page.innerHTML = `
              <p><strong>From: </strong>${email.sender}</p>
              <p><strong>To: </strong>${email.recipients}</p>
              <p><strong>Subject: </strong>${email.subject}</p>
              <p><strong>Timestamp: </strong>${email.timestamp}</p>

              <hr>
              <p >${email.body}</p>`;
              const hr = page.querySelector('hr');
              page.insertBefore(button, hr);
              page.insertBefore(reply, hr);
              check = true

           }else if(mailbox === "archive"){
              button.textContent = 'Unarchive';
              reply.textContent = 'Reply';
              page.innerHTML = `
              <p><strong>From: </strong>${email.sender}</p>
              <p><strong>To: </strong>${email.recipients}</p>
              <p><strong>Subject: </strong>${email.subject}</p>
              <p><strong>Timestamp: </strong>${email.timestamp}</p>

              <hr>
              <p>${email.body}</p>`;
              const hr = page.querySelector('hr');
              page.insertBefore(button, hr);
              page.insertBefore(reply, hr);
              check = false
           }
           else{
              page.innerHTML = `
              <p><strong>From: </strong>${email.sender}</p>
              <p><strong>To: </strong>${email.recipients}</p>
              <p><strong>Subject: </strong>${email.subject}</p>
              <p><strong>Timestamp: </strong>${email.timestamp}</p>
              <hr>
              <p >${email.body}</p>`;
           }
           button.addEventListener('click', () => {
           fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: check
            })

           })
           .then(response => {
              if(response.ok){
                load_mailbox('inbox')
              }
           });

           });

           reply.addEventListener('click', () => {
              compose_email()
              document.querySelector('#compose-recipients').value = email.sender ;

              if(`${email.subject}`.startsWith('RE:')){
                document.querySelector('#compose-subject').value = `${email.subject}`;
              }else{
                document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
              }
              document.querySelector('#compose-body').value =
              `On ${email.timestamp}, ${email.sender} wrote:

              ${email.body}`;

           });


           document.querySelector('#emails-page').append(page);



        });
});
        if (email.read) {
              element.style.backgroundColor = 'rgb(211, 211, 211)';
        } else {
            element.style.backgroundColor = 'white';
        }


        document.querySelector('#emails-view').append(element);
        });

        });



}




function sending_emails(event) {

    event.preventDefault();
    const recipient = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;
    const email = {
    recipients: recipient,
    subject: subject,
    body: body
};
    fetch('/emails',{
      method: 'POST',
      body: JSON.stringify(email)
    })
    .then(response => response.json())
    .then(result => {
      console.log(result)
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';});
}
