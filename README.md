# Facesheet360: Modern Healthcare Management System

## Project Overview

Facesheet360 is an innovative healthcare management system designed to streamline patient care for healthcare professionals. It provides a secure, efficient, and integrated platform for managing patient data, charting, and now, a novel CareCoin blockchain integration for incentivizing and tracking healthcare activities.

## Features

### Core Healthcare Management
*   **Patient Charting:** Comprehensive tools for recording vital signs, medications, lab results, imaging, and patient notes.
*   **Patient Management:** Efficiently manage patient profiles, appointments, and care plans.
*   **Dashboard & Analytics:** Overview of key patient statistics, pending tasks, and recent activities.
*   **Communication Tools:** Integrated features for communication within the healthcare team.
*   **User Authentication:** Secure login and user role management.

### AI-Powered Enhancements
*   **AI-Assisted Care Plan Generation:** Leverages artificial intelligence to suggest personalized care plans based on patient data, medical history, and best practices, aiding healthcare professionals in creating comprehensive and effective treatment strategies.
*   **Wound Analysis and Monitoring:** Utilizes AI for advanced image analysis of wounds, assisting in accurate assessment, tracking healing progress, and identifying potential complications early.

### Advanced Blockchain Integration (CareCoin)
Facesheet360 leverages a custom, private Proof-of-Stake (PoS) blockchain network to introduce **CareCoins**, a digital incentive for healthcare activities.

*   **MetaMask Integration:** Seamlessly connect your MetaMask wallet to manage your CareCoins directly within the application.
*   **CareCoin (ERC-20 Token):** A custom digital token designed to reward healthcare providers for their charting activities and enable new functionalities.
*   **Staking Functionality:** Users can stake their CareCoins on the blockchain, participating in the network's security and potentially earning rewards (requires a deployed CareCoin smart contract with staking capabilities).
*   **Backend-Driven Minting for Charting:**
    *   CareCoins are minted and awarded to healthcare providers whenever they chart patient data in the system.
    *   This minting process is securely handled by a dedicated backend service.
    *   **Anonymized On-Chain Data:** To ensure patient privacy, only anonymized metadata (e.g., a cryptographic hash of non-identifiable charting details, creator ID, amount, timestamp) is recorded on the public ledger. Sensitive patient identifiable information (PII) remains securely off-chain in your primary database.
    *   This approach ensures that the blockchain acts as a transparent, immutable record of activity without compromising patient confidentiality.

### Enhanced User Interface
*   **Modern Design Aesthetics:** The application features a refreshed, clean, and intuitive user interface.
*   **Improved Visuals:** Enhanced use of shadows, borders, and subtle animations for a more polished and engaging user experience on both the homepage and dashboard.

## Technologies Used

This project is built with a modern web development stack:

*   **Frontend:**
    *   **React:** A declarative, component-based JavaScript library for building user interfaces.
    *   **Vite:** A fast and opinionated build tool for modern web projects.
    *   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
    *   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
    *   **shadcn/ui:** A collection of re-usable components built with Radix UI and Tailwind CSS.
    *   **Ethers.js:** A complete and compact library for interacting with the Ethereum blockchain and its ecosystem.
*   **Backend (Conceptual - Requires separate implementation):**
    *   A secure backend service (e.g., Node.js, Python) for handling sensitive operations like CareCoin minting, database interactions, and API integrations.
*   **Blockchain (Conceptual - Requires separate setup):**
    *   A private Ethereum-compatible Proof-of-Stake (PoS) network for the CareCoin blockchain.

## Setup and Running the Project

To get a local copy up and running, follow these steps:

### Prerequisites

*   Node.js & npm (recommended to install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
*   **Conceptual:** A running instance of your private Ethereum-compatible PoS blockchain network.
*   **Conceptual:** Your CareCoin ERC-20 smart contract deployed on your private network.
*   **Conceptual:** A backend service configured to interact with your private blockchain for minting.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd facesheet360
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Update Blockchain Configuration:**
    *   Open `src/lib/web3.ts` and replace `"0xYourCareCoinContractAddressHere"` with the actual address of your deployed CareCoin smart contract. Ensure the `contractABI` matches your contract's ABI, including `stake`, `unstake`, and `mint` functions.

### Running the Development Server

```sh
npm run dev
```

This will start the development server with auto-reloading and an instant preview.

### Important Notes for Blockchain Functionality

*   **MetaMask:** Ensure you have the MetaMask browser extension installed and configured to connect to your private blockchain network.
*   **CareCoin Contract:** The CareCoin contract must be deployed to your private network for the blockchain features (staking, transfers, balance display) to function.
*   **Backend for Minting:** The minting of CareCoins upon charting is designed to be handled by a secure backend service. The frontend currently simulates this interaction by making a `fetch` call to a hypothetical `/api/mint-carecoin` endpoint. You will need to implement this backend service separately.

## How to Contribute
Contributions are welcome!

1. Fork the repository and create your branch from `main`.
2. Install dependencies with `npm install`.
3. Run `npm run lint` and `npm run build` to verify your changes.
4. Submit a pull request with a clear description.

## Deployment

1. Build the production assets:
   ```sh
   npm run build
   ```
   The output will be located in the `dist` directory.
2. Preview the build locally:
   ```sh
   npm run preview
   ```
3. Deploy the contents of `dist` to your preferred static hosting provider (e.g., Netlify, Vercel). Ensure that required environment variables are configured on the host.
