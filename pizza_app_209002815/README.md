# Pizza Ordering System - Assignment 2

## Team
- Aviad Benita, ID 209002815
- Eliav Cohen, ID 208698100

Repository: https://github.com/Avihu7/Pizza

## Project structure
```
pizza_app_209002815/
  server/   Node.js + Express server, the single source of truth for price,
            validation, and order status
  client/   React (Vite) UI, talks to the server only and never stores
            prices on its own
  README.md
```

## Running - server
```bash
cd server
npm install
npm start
```
The server runs on port `3001` by default (override with the `PORT` environment variable).

## Running - client
```bash
cd client
npm install
npm run dev
```
The client runs on `http://localhost:5173` by default and talks to the server at
`http://localhost:3001` (override with the `VITE_API_URL` environment variable).
The server must be running at the same time for the client to work.

For a production build: `npm run build` inside the `client` directory.

## Where the price is calculated, and why
The total price is calculated **exclusively on the server**, in
`server/src/services/pricing.js`, based on the pizza/size/topping ids received
from the client, matched against the real menu data in `server/src/data/menu.js`.
The client only ever sends ids (`pizzaId`, `sizeId`, `toppingIds`) and never sends
a price. The client shows a local "estimated price" to improve the user experience
before submission, but the final price shown to the user after the order is created
(`totalPrice`) always comes back from the server. This prevents a client (or a
client-side bug) from being able to "change" a price.

## Our personal rule and how it's implemented
Based on the last digit of the submitting student's ID (209002815 -> digit 5):
**an order cannot contain more than 5 pizzas.**

Implemented on the server in `server/src/validation/orderValidation.js` (the
constant `MAX_PIZZAS_PER_ORDER = 5`) - any order with more than 5 pizza items is
rejected with a 400 status code. On the client, in
`client/src/components/CustomerView.jsx`, the "Add to cart" button is disabled
once the cart already has 5 pizzas, to give immediate feedback - but the real
enforcement always happens on the server.

## Mock payment
The mock payment happens on the client before the order is sent to the server
(clicking the "Pay (mock) and send order" button). Therefore, by the time an order
reaches the server it has already been "paid" from the system's logical flow, which
is why `paymentStatus` always starts as `"paid"` (not `"pending"`), and no real
payment details are ever stored - this is a mock payment only.

## What happens when a customer submits an invalid order
The server runs a series of validations (`server/src/validation/orderValidation.js`)
on the request body: missing required fields, fewer than one pizza,
`sizeId`/`pizzaId`/`toppingId` values that don't exist in the menu, more than 3
toppings on a pizza, or more than 5 pizzas in an order (our personal rule) - each of
these cases returns a `400` response with a clear message in the `error` field, and
the order is never saved. The client displays that error message to the user below
the submit button.

## Changes from the Assignment 1 design
No substantial design changes were made. The only change is a technical adjustment:
adding a unique `id` to every menu item (pizza/size/topping) so the client can refer
to items by id instead of by name - necessary for implementing the API, but it does
not change the data model or business logic that was originally designed.

## Questions

**1. What is the difference between the client side and the server side in your system?**
The server is the source of truth: it holds the menu, validates all input,
calculates the price, stores orders in memory, and enforces the order status state
machine. The client is only an interface - it displays information coming from the
server and sends requests, and never makes a business decision on its own (not even
about price).

**2. Where is the total price calculated, and why?**
On the server only, in `server/src/services/pricing.js`, so that a price can never
be forged from the browser - the server recalculates it from the real menu on every
request.

**3. What happens when a customer sends an invalid order?**
The server returns `400` with a descriptive error message (for example, an unknown
id, more than 3 toppings, or more than 5 pizzas), and the order is never created or
saved.

**4. What happens after the mock payment succeeds?**
The client sends the order to the server (`POST /api/orders`). The server validates
it, calculates the price, creates an order with `status: "new"` and
`paymentStatus: "paid"`, and returns it with a `201` status code. The client
displays a confirmation with the order number and current status.

**5. What is your personal rule?**
An order cannot contain more than 5 pizzas (the last digit of ID 209002815 is 5).

**6. What was the most challenging part of the assignment?**
Designing a rigid state machine (`new -> preparing -> ready -> delivered`) that
enforces both preventing skipped steps and preventing moving backwards, while
returning the correct error code (409) without breaking the valid flow.

**7. What is one design decision you made, and why?**
We chose to give every menu item a unique `id` instead of relying on its name, so
the client always communicates with the server through stable identifiers - that
way, a future change to a display name won't break existing orders or validation.
