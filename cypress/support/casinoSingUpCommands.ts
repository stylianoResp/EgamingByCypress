/// <reference types="cypress" />

// This file contains custom Cypress commands and helper functions for the Sign-Up process.
// It uses the Faker library to generate random user data for testing.

// Import faker library for generating random test data
import { faker } from '@faker-js/faker'
import { eq } from 'cypress/types/lodash';

// Custom Command: Generate random customer details using Faker
const customerDetails = () => {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phoneNumber: faker.number.int({ min: 100000, max: 999999 }).toString(),
        // Day of birth as two digits (e.g., 01, 02)
        dayOfBirth: faker.number.int({ min: 1, max: 30 }).toString().padStart(2, '0'),
        monthOfBirth: faker.date.month(),
        yearOfBirth: faker.number.int({ min: 1950, max: 2005 }).toString().padStart(2, '0'),
        postalCode: faker.number.int({ min: 1000, max: 9999 }).toString()
    }
}

// Helper: Map month names to numbers for assertions
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

// Custom Helper: Click the "Sign up" button and ensure the modal is visible
const singUpButton = () => {
    cy.get('.header__right')
        .contains('Sign up')
        .should('be.visible')
        .should('be.enabled')
        .click()
    cy.get('.modal-authentication > .modal__dialog > .modal__content').should('be.visible')
}

// Step 1: Fill or validate email and password fields
// - If shouldFillAllData: fill with valid random data
// - If shouldProvideInvalidData: fill with invalid data
// - Otherwise: just assert fields are visible and empty
const newCustomerDataStep1 = (shouldFillAllData = false, shouldProvideInvalidData = false) => {
    const customerData = customerDetails()
    cy.get('.flex-grow').should('be.visible').within(() => {
        cy.contains('Step 1/2');
        cy.contains('Create an account');
        cy.contains('Sign up and start playing in less than 60 seconds.');
        cy.contains('I am over 18 years old and I accept the Terms and conditions and privacy policy');
        cy.get('select[id="form.country_id"]').select('Cyprus')     

        if (shouldFillAllData) {
            // Fill and save email to a fixture file
            cy.get('#emailSignup').clear().type(customerData.email, { parseSpecialCharSequences: false }).should('have.value', customerData.email).invoke('text').then((email) => {
                cy.writeFile('cypress/fixtures/randomEmail.json', { userEmail: customerData.email })
            });
            // Fill and save password to a fixture file
            cy.get('#passwordSignup').clear().type(customerData.password, { parseSpecialCharSequences: false }).should('have.value', customerData.password).invoke('text').then((password) => {
                cy.writeFile('cypress/fixtures/randomPassword.json', { userPassword: customerData.password })
            })
        }
        else if (shouldProvideInvalidData) {
            // Fill with invalid email and password
            cy.get('#emailSignup').clear().type('invalidemail')
            cy.get('#passwordSignup').clear().type('1234')
        }
        else {
            // Just assert the fields are visible and empty
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

// Step 2: Fill or validate personal details fields
// - If shouldFillAllData: fill with valid random data
// - If shouldProvideInvalidData: fill with invalid data
// - Otherwise: just assert fields are visible and empty
const newCustomerDataStep2 = (shouldFillAllData = false, shouldProvideInvalidData = false) => {
    const customerData = customerDetails()
    const monthName = customerData.monthOfBirth;
    const monthValue = IntMonth[monthName];

    cy.get('.flex-grow').should('be.visible').within(() => {
        cy.contains('Step 2/2');
        cy.contains('Create an account');
        cy.contains('Sign up and start playing in less than 60 seconds.');
        cy.contains('I am over 18 years old and I accept the Terms and conditions and privacy policy');

        if (shouldFillAllData) {
            cy.log('all fields will be filled')
            // Fill and save first name, last name, and phone to fixture files
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
            // Fill postal code and date of birth
            cy.get('input[label="Postal code"]').type(customerData.postalCode).wait(1000).should('have.value', customerData.postalCode)
            cy.get('select[id="dob.day"]').select(customerData.dayOfBirth).wait(1000).should('have.value', customerData.dayOfBirth);
            cy.get('select[id="dob.month"]').select(customerData.monthOfBirth).wait(1000).should('have.value', monthValue);
            cy.get('select[id="dob.year"]').select(customerData.yearOfBirth).wait(1000).should('have.value', customerData.yearOfBirth);

            // Intercept registration API and assert success
            cy.intercept('POST', '/livewire/update').as('livewireUpdate');
            cy.contains('Register').should('be.enabled').click();
            cy.wait('@livewireUpdate',{timeout:7000}).then((interception) => {
                expect([200, 302]).to.include(interception.response?.statusCode);
            })
        }
        else if (shouldProvideInvalidData) {
            cy.log('invalid Data will be provided')
            // Fill with invalid first and last name
            cy.get('input[label="First name"]').type('****90');
            cy.get('input[label="Last name"]').type('907906{}');
            cy.get('input[label="Phone"]').type(`99${customerData.phoneNumber}`).wait(1000).should('have.value', `99${customerData.phoneNumber}`);
            cy.get('input[label="Postal code"]').type(customerData.postalCode).wait(1000).should('have.value', customerData.postalCode)
            cy.get('select[id="dob.day"]').select(customerData.dayOfBirth).wait(1000).should('have.value', customerData.dayOfBirth);
            cy.get('select[id="dob.month"]').select(customerData.monthOfBirth).wait(1000).should('have.value', monthValue);
            cy.get('select[id="dob.year"]').select(customerData.yearOfBirth).wait(1000).should('have.value', customerData.yearOfBirth);
            cy.contains('Register').should('be.enabled').click();
        }
        else {
            cy.log('No Data , fields will be empty')
            // Just assert the fields are visible and empty
            cy.get('input[label="First name"]').should('have.attr', 'placeholder', 'John');
            cy.get('input[label="Last name"]').should('have.attr', 'placeholder', 'Doe');
            cy.get('input[label="Postal code"]').should('have.attr', 'placeholder', '1070');
            cy.get('select[id="dob.day"]').should('have.value', null);
            cy.get('select[id="dob.month"]').should('have.value', null);
            cy.get('select[id="dob.year"]').should('have.value', null);
            cy.contains('Register').should('be.enabled').click();
        }
    });
};

// Wrapper command to run the full sign-up form process
// Accepts a dataType string to determine which scenario to run
const signUpForm = (dataType: string): void => {
    switch (dataType) {
        case "areEmptyData":
            // Step 1: Click sign-up button
            singUpButton()
            // Step 2: Check Step 1 form (fields empty)
            newCustomerDataStep1()
            // Step 3: Check Step 2 form (fields empty)
            newCustomerDataStep2()
            // Capture and save error message for empty fields
            cy.get('.gap-y-2').invoke('text').then((text) => {
                let errorMessage = text.replace(/\s+/g, ' ').trim();             
                cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)
                cy.writeFile('cypress/fixtures/emtpyFieldsMessageAllEmpty.json', { message: errorMessage })
            })
            break;
        case "areAllFilled":
            // Step 1: Click sign-up
            singUpButton()
            // Step 2: Fill Step 1 form with valid data
            newCustomerDataStep1(true)
            // Step 3: Fill Step 2 form with valid data
            newCustomerDataStep2(true)
            // If error message appears, capture and save it
            cy.get('body').then((body) => {
                cy.log('if alert message is visible,somthing not filled properly')
                if (body.find('.gap-y-2').length > 0) {
                    cy.get('.gap-y-2').invoke('text').then((text) => {
                        let errorMessage = text.replace(/\s+/g, ' ').trim();  
                        cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)
                        cy.writeFile('cypress/fixtures/emtpyFieldsMessage.json', { message: errorMessage })
                    })
                }
            })
            break;
        case "isInvalidPasswordAndEmail":
            // Step 1: Click sign-up
            singUpButton()
            // Step 2: Fill Step 1 form with invalid data
            newCustomerDataStep1(false, true)
            // Step 3: Fill Step 2 form with valid data
            newCustomerDataStep2(true)
            // Capture and save error message for invalid email/password
            cy.get('.gap-y-2').invoke('text').then((text) => {
                let errorMessage = text.replace(/\s+/g, ' ').trim();
                cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)
                cy.writeFile('cypress/fixtures/emtpyFieldsMessagePasswordEmail.json', { message: errorMessage })
            })
            break;
        case "isInvalidFirstNameLastName":
            // Step 1: Click sign-up
            singUpButton()
            // Step 2: Fill Step 1 form with valid data
            newCustomerDataStep1(true)
            // Step 3: Fill Step 2 form with invalid data
            newCustomerDataStep2(false, true)
            // Capture and save error message for invalid name/lastname
            cy.get('.gap-y-2').invoke('text').then((text) => {
                let errorMessage = text.replace(/\s+/g, ' ').trim();
                cy.log(`Please fill the Sign Up Form with correct Data:  ${errorMessage}`)
                cy.writeFile('cypress/fixtures/emtpyFieldsMessageForInvalidNameLastName.json', { message: errorMessage })
            })
            break;
    }
}

// Custom Command: Validate customer profile after registration
// Asserts that the sidebar, profile tab, and user details are visible and correct
const validationOfCustomer = ():void =>{
    // Sidebar should be visible
    cy.get('.sidebar__balance').should('be.visible')
    // Open profile tab
    cy.get('.tab-user').should('be.visible',{timeout:7000}).contains('Profile').click()
    // Contact details card should be visible
    cy.get('.grid > :nth-child(1) > .card__user').should('be.visible')
    // Assert email and phone from saved fixture files
    cy.get('div[class="card__user"]').wait(5000).eq(1).within(()=>{
        cy.readFile('cypress/fixtures/randomEmail.json').then((email)=>{
          const verifyEmail = email.userEmail.toString()
          cy.get('.has-placeholder > .form-input').should('include.value',verifyEmail)
          cy.log(`user succesfully verified with email :${verifyEmail}`)
        })
        cy.readFile('cypress/fixtures/randomPhone.json').then((phone)=>{
            const verifyPhone = phone.userPhone.toString()
            cy.get('#user-profile-phone-number').should('include.value',`${verifyPhone}`)
            cy.log(`user succesfully verified with phone : 99${verifyPhone}`)
        })
    })
    // Assert first and last name from header avatar
    cy.readFile('cypress/fixtures/randomfirstName.json').then((firstName)=>{
    cy.readFile('cypress/fixtures/randomlastName.json').then((lastName)=>{  
        const verifyFirstName = firstName.userFirstName.toString()
        const verifyLastName = lastName.userLastName.toString()
    cy.get('.header__user-avatar--name').should('include.text',`${verifyFirstName} ${verifyLastName}`)
})})
}

// Register custom Cypress commands
Cypress.Commands.add('signUpForm', signUpForm)
Cypress.Commands.add('validationOfCustomer',validationOfCustomer)

