# International Payment System

## Features
- **Customer Registration:** Customers can register for the system by providing their full name, email, id number, account number and password
- **Customer Login:** Customers can log into their account by providing their email, account number and password (email = 'username')
- **Make Payments:** Customers can make payments with SWIFT by:
	- Entering the amount they need to pay
	- Choosing a currency
	- Cooosing a payment provider
	- Entering the name of the recipient 
	- Entering the account number of the recipient


## Security Measures 
- Whitelisting input with RegEx
- Enforcing password security with hashing and salting
- Traffic is served over SSL
- SQL Injections:
  - Using...
- Session Jacking:
  - Using...
- Click Jacking:
  - Using...
- Cross Site Scripting attacks: 
  - Using express validator and DOMPurify to sanitise and validate user input
- Man-In-The-Middle attacks: 
  - Using CORS to restrict which domains have access to (can call) the API
  - Using Helmet to add security headers
- DDos attacks:
  - Using rate limiter to restrict the number of requests that can be made by an IP address and slow down requests
	
	
## Installing & Running 
1. Clone this GitHub repository using
   ```
   cd https://github.com/VCSTDN2024/insy7314-part2-adastra.git
2. Open the project in Visual Studio Code
3. Install packages in both the backend and frontend

   - In one terminal run `cd Backend ` then `npm install`

   - In another terminal run ` cd frontend` then `npm install`
4. Execute the backend by running `npm run dev` 
5. Then execute the frontend by running `npm start`

## Video Demonstration
		
