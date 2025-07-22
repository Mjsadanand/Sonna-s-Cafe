import React from "react";
import Link from "next/link";

const TermsPage = () => (
    <>
        <main
            style={{
                maxWidth: 600,
                margin: "2rem auto",
                padding: "2rem",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                fontFamily: "Segoe UI, Arial, sans-serif",
            }}
        >
            <h1 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#2d3748" }}>
                Terms and Conditions
            </h1>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#4a5568" }}>
                Welcome to Sonna&apos;s Cafe! By using our website and services, you agree to the following terms and conditions:
            </p>
            <ul style={{ paddingLeft: "1.2rem", marginBottom: "1.5rem" }}>
                <li style={{ marginBottom: "0.7rem" }}>All orders are subject to availability and confirmation.</li>
                <li style={{ marginBottom: "0.7rem" }}>Prices and menu items may change without prior notice.</li>
                <li style={{ marginBottom: "0.7rem" }}>
                    Please review your order carefully before submitting. We are not responsible for incorrect orders.
                </li>
                <li style={{ marginBottom: "0.7rem" }}>
                    Personal information provided will be used only for order processing and will not be shared.
                </li>
                <li style={{ marginBottom: "0.7rem" }}>
                    Payments must be made through the available payment options on our website.
                </li>
                <li style={{ marginBottom: "0.7rem" }}>
                    For any issues or concerns, please contact our support team via{" "}
                    <a
                        href="mailto:support@sonnascafe.com"
                        style={{ color: "#3182ce", textDecoration: "underline" }}
                    >
                        Email
                    </a>.
                </li>
            </ul>
            <p style={{ textAlign: "center", fontWeight: 500, color: "#2d3748" }}>
                Thank you for choosing Sonna&apos;s Cafe!
            </p>
        </main>
    </>
);

export default TermsPage;