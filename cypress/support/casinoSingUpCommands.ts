/// <reference types="cypress" />

// This line enables Cypress auto-completion and types in your editor.
// It helps the IDE understand Cypress commands like cy.get(), cy.contains(), etc.

//import faker library from package.json
import { faker } from '@faker-js/faker'
import { eq } from 'cypress/types/lodash';


// Custom Command to have properties of Customer Details  , created from faker library
const customerDetails = () => {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phoneNumber: faker.number.int({ min: 100000, max: 999999 }).toString(),
        //day for selection bewteen 1-10 etc 01,02
        dayOfBirth: faker.number.int({ min: 1, max: 30 }).toString().padStart(2, '0'),
        monthOfBirth: faker.date.month(),
        yearOfBirth: faker.number.int({ min: 1950, max: 2005 }).toString().padStart(2, '0'),
        postalCode: faker.number.int({ min: 1000, max: 9999 }).toString()
    }


}

//variable to create properties for  month as numbers  for assertion peprose
const IntMonth = {

    January: '1',
    February: '2',
    March: '3',
    April: '4',
    May: '5',
    June: '6',
    July: '7',
    August: '8',
    September: '9',
    October: '10',
    November: '11',
    December: '12',
};

// Custom helper function to click the "Sign up" button
const singUpButton = () => {

    cy.get('.header__right')
        .contains('Sign up')
        .should('be.visible')
        .should('be.enabled')
        .click()
    cy.get('.modal-authentication > .modal__dialog > .modal__content').should('be.visible')
}

// Custom helper Step 1: Fill email and password based on shouldFillAllData flag,  invalid data if houldProvideInvalidData
const newCustomerDataStep1 = (shouldFillAllData = false, shouldProvideInvalidData = false) => {
    const customerData = customerDetails()
    //use within to avoid the asyscronus run of cypress , especially when field are included in the same combonent
    cy.get('.flex-grow').should('be.visible').within(() => {
        cy.contains('Step 1/2');
        cy.contains('Create an account');
        cy.contains('Sign up and start playing in less than 60 seconds.');
        cy.contains('I am over 18 years old and I accept the Terms and conditions and privacy policy');
        cy.get('select[id="form.country_id"]').select('Cyprus')     

        if (shouldFillAllData) {
            //fill and check , invoke to a json the email data
            cy.get('#emailSignup').clear().type(customerData.email, { parseSpecialCharSequences: false }).should('have.value', customerData.email).invoke('text').then((email) => {
                cy.writeFile('cypress/fixtures/randomEmail.json', { userEmail: customerData.email })
            });
            //fill and check , invoke to a json the password data
            cy.get('#passwordSignup').clear().type(customerData.password, { parseSpecialCharSequences: false }).should('have.value', customerData.password).invoke('text').then((password) => {
                cy.writeFile('cypress/fixtures/randomPassword.json', { userPassword: customerData.password })
            })
        }
        else if (shouldProvideInvalidData) {
            //adding hardcoded invalid data for email
            cy.get('#emailSignup').clear().type('invalidemail')
            //adding hardcoded invalid data for password
            cy.get('#passwordSignup').clear().type('1234')
        }
        else {
            // Just assert the fields (or leave them empty)
            cy.get('#passwordSignup')
                .should('be.visible')
                .and('have.attr', 'placeholder', 'Enter your password');
            cy.get('#emailSignup')
                .should('be.visible')
                .and('have.attr', 'placeholder', 'john.doe@example.com');
        }

        cy.contains('Continue').should('be.enabled').click();
    });
};

// Custom helper Step 2: Fill customer based on shouldFillAllData flag, invalid data if houldProvideInvalidData
const newCustomerDataStep2 = (shouldFillAllData = false, shouldProvideInvalidData = false) => {
    //use  new variable to access the properties
    const customerData = customerDetails()

    //use variable to assert the Month of birth  with number value
    const monthName = customerData.monthOfBirth; // e.g., "June"
    const monthValue = IntMonth[monthName]; // e.g., "6"

    cy.get('.flex-grow').should('be.visible').within(() => {
        cy.contains('Step 2/2');
        cy.contains('Create an account');
        cy.contains('Sign up and start playing in less than 60 seconds.');
        cy.contains('I am over 18 years old and I accept the Terms and conditions and privacy policy');

        if (shouldFillAllData) {
            cy.log('all fields will be filled')
            //giving manual wating time to give time to cypress for fill and assert the Data

            //invoking data for later use
            cy.get('input[label="First name"]').type(customerData.firstName).wait(1000).should('have.value', customerData.firstName)
            .invoke('text').then((firstName) => {
                cy.writeFile('cypress/fixtures/randomfirstName.json', { userFirstName: customerData.firstName })
            })
            cy.get('input[label="Last name"]').type(customerData.lastName).wait(1000).should('have.value', customerData.lastName)
            .invoke('text').then((lastName) => {
                cy.writeFile('cypress/fixtures/randomlastName.json', { userLastName: customerData.lastName})
            })

            cy.get('input[label="Phone"]').type(`99${customerData.phoneNumber}`).wait(1000).should('have.value', `99${customerData.phoneNumber}`)
            .invoke('text').then((phone) => {
                cy.writeFile('cypress/fixtures/randomPhone.json', { userPhone: customerData.phoneNumber })
            });
            //postal code will be commented , issue in the env postal code field is missing
            //cy.get('input[label="Postal code"]').type(customerData.postalCode).wait(1000).should('have.value', customerData.postalCode)

            cy.get('select[id="dob.day"]').select(customerData.dayOfBirth).wait(1000).should('have.value', customerData.dayOfBirth);
            cy.get('select[id="dob.month"]').select(customerData.monthOfBirth).wait(1000).should('have.value', monthValue);
            cy.get('select[id="dob.year"]').select(customerData.yearOfBirth).wait(1000).should('have.value', customerData.yearOfBirth);

            //intercept the api Post which is asserting the succesfull registration 
            cy.intercept('POST', '/livewire/update').as('livewireUpdate');
            // Click the register button
            cy.contains('Register').should('be.enabled').click();

            //api should be 200
            cy.wait('@livewireUpdate',{timeout:7000}).then((interception) => {
                expect([200, 302]).to.include(interception.response?.statusCode);
            })
        }
        else if (shouldProvideInvalidData) {
            cy.log('invalid Data will be provided')
            //giving  invalid hardcoded data for name and lastname
            cy.get('input[label="First name"]').type('****90');
            cy.get('input[label="Last name"]').type('907906{}');
            cy.get('input[label="Phone"]').type(`99${customerData.phoneNumber}`).wait(1000).should('have.value', `99${customerData.phoneNumber}`);
             //postal code will be commented , issue in the env postal code field is missing
           // cy.get('input[label="Postal code"]').type(customerData.postalCode).wait(1000).should('have.value', customerData.postalCode)

            cy.get('select[id="dob.day"]').select(customerData.dayOfBirth).wait(1000).should('have.value', customerData.dayOfBirth);
            cy.get('select[id="dob.month"]').select(customerData.monthOfBirth).wait(1000).should('have.value', monthValue);
            cy.get('select[id="dob.year"]').select(customerData.yearOfBirth).wait(1000).should('have.value', customerData.yearOfBirth);
            cy.contains('Register').should('be.enabled').click();
        }
        else {
            cy.log('No Data , fields will be empty')
            // Just assert the fields (or leave them empty)
            cy.get('input[label="First name"]').should('have.attr', 'placeholder', 'John');
            cy.get('input[label="Last name"]').should('have.attr', 'placeholder', 'Doe');
             //postal code will be commented , issue in the env postal code field is missing
           // cy.get('input[label="Postal code"]').should('have.attr', 'placeholder', '1070');
            cy.get('select[id="dob.day"]').should('have.value', null);
            cy.get('select[id="dob.month"]').should('have.value', null);
            cy.get('select[id="dob.year"]').should('have.value', null);
            cy.contains('Register').should('be.enabled').click();
        }
    });
};

//Wrapper command to run the full sign-up form process
const signUpForm = (dataType: string): void => {

    switch (dataType) {

        case "areEmptyData":

            singUpButton()           // Step 1: Click sign-up button
            newCustomerDataStep1()   // Step 2: Check Step 1 form
            newCustomerDataStep2()   // Step 3: Check Step 2 form

            //capture the error message alert
            cy.get('.gap-y-2').invoke('text').then((text) => {

                //create a string variable to add the text,edit the text with space after any . or !
                let errorMessage = text.replace(/\s+/g, ' ').trim();             
                cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)

                //save the message to a json file  , for later use and validations
                cy.writeFile('cypress/fixtures/emtpyFieldsMessageAllEmpty.json', { message: errorMessage })
            })
            break;
 
        case "areAllFilled":
            singUpButton() //Step 1 : Click sign-up
            newCustomerDataStep1(true) //Step 2 : Fill Step 1 form
            newCustomerDataStep2(true) // Step 3 : Fill Step 2 Form
            cy.get('body').then((body) => {
                cy.log('if alert message is visible,somthing not filled properly')
                if (body.find('.gap-y-2').length > 0) {
                    cy.get('.gap-y-2').invoke('text').then((text) => {
                        //create a string variable to add the text,edit the text with space after any . or !
                        let errorMessage = text.replace(/\s+/g, ' ').trim();  
                        cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)

                        //save the message to a json file  , for later use
                        cy.writeFile('cypress/fixtures/emtpyFieldsMessage.json', { message: errorMessage })
                    })
                }
            })
            break;

        case "isInvalidPasswordAndEmail":
            singUpButton() //Step 1 : Click sign-up
            newCustomerDataStep1(false, true) //Step 2 : Fill with invalide Step 1 form
            newCustomerDataStep2(true) // Step 3 : Fill Step 2 Form

            //capture the error message alert
            cy.get('.gap-y-2').invoke('text').then((text) => {

                //create a string variable to add the text,edit the text with space after any . or !
                let errorMessage = text.replace(/\s+/g, ' ').trim();
                cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)

                //save the message to a json file  , for later use and to check the incorrect data
                cy.writeFile('cypress/fixtures/emtpyFieldsMessagePasswordEmail.json', { message: errorMessage })
            })
            break;

        case "isInvalidFirstNameLastName":
            singUpButton() //Step 1 : Click sign-up
            newCustomerDataStep1(true) //Step 2 : Fill Step 1 form , set as true will fill the Step 1
            newCustomerDataStep2(false, true) // Step 3 : with invalide  Fill Step 2 Form , set as false will proceed two second parameter 

            //capture the error message alert
            cy.get('.gap-y-2').invoke('text').then((text) => {

                //create a string variable to add the text,edit the text with space after any . or !
                let errorMessage = text.replace(/\s+/g, ' ').trim();
                cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)

                //save the message to a json file  , for later use and to check the incorrect data
                cy.writeFile('cypress/fixtures/emtpyFieldsMessageForInvalidNameLastName.json', { message: errorMessage })
            })
            break;
    }


}

// Different Page ,different action, new custom command for test should be created

const validationOfCustomer = ():void =>{

    //side bar to be visible , 
    cy.get('.sidebar__balance').should('be.visible')
    //validate data of new customer after sign up 
    cy.get('.tab-user').should('be.visible',{timeout:7000}).contains('Profile').click()
    //contact details should be visible 
    cy.get('.grid > :nth-child(1) > .card__user').should('be.visible')
    //inside of the card user combonent
    cy.get('div[class="card__user"]').wait(5000).eq(1).within(()=>{
        //read the invoke email data which was saved during the test
        cy.readFile('cypress/fixtures/randomEmail.json').then((email)=>{
          //store it in a string variable
          const verifyEmail = email.userEmail.toString()
          //now assert the text of the element
          cy.get('.has-placeholder > .form-input').should('include.value',verifyEmail)
          cy.log(`user succesfully verified with email :${verifyEmail}`)
        })
        cy.readFile('cypress/fixtures/randomPhone.json').then((phone)=>{
            const verifyPhone = phone.userPhone.toString()
            cy.get('#user-profile-phone-number').should('include.value',`${verifyPhone}`)
            cy.log(`user succesfully verified with phone : 99${verifyPhone}`)
        })
    })
    //name is not included on profile tab so asserting from header avatar
    cy.readFile('cypress/fixtures/randomfirstName.json').then((firstName)=>{
    cy.readFile('cypress/fixtures/randomlastName.json').then((lastName)=>{  
        const verifyFirstName = firstName.userFirstName.toString()
        const verifyLastName = lastName.userLastName.toString()
    cy.get('.header__user-avatar--name').should('include.text',`${verifyFirstName} ${verifyLastName}`)
})})
}


Cypress.Commands.add('signUpForm', signUpForm)
Cypress.Commands.add('validationOfCustomer',validationOfCustomer)

