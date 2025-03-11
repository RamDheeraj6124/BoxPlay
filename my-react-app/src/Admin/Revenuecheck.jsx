import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2"; 
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'; 
import './RevenueCheck.css'

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenueCheck = () => {
    const [shopRevenue, setShopRevenue] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        const checkRevenue = async () => {
            try {
                const response = await fetch('http://localhost:5000/admin/checkrevenue', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data); 
                    setTotalRevenue(data.totalRevenue);
                    setShopRevenue(data.shopRevenues);
                } else {
                    throw new Error("Expected JSON, but received: ");
                }
            } catch (error) {
                console.error("Error fetching revenue data:", error);
            }
        };
        checkRevenue();
    }, []);

    const chartData = {
        labels: shopRevenue.map((shop) => shop.shopName),
        datasets: [{
            label: 'Shop Revenue',
            data: shopRevenue.map((shop) => shop.platformFee),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        }],
    };

    return (
        <div className="rc-revenue-check">
            <h1>Total Revenue: {totalRevenue}</h1>
            <h2>Shop Revenue Breakdown:</h2>
            <ul>
                {shopRevenue.length > 0 ? (
                    shopRevenue.map((shop) => (
                        <li key={shop.shopId}>{shop.shopName}: {shop.platformFee}</li>
                    ))
                ) : (
                    <li>No shop revenue data available.</li>
                )}
            </ul>
            <h2>Revenue Distribution</h2>
            <div className="rc-pie-chart">
                <Pie data={chartData} />
            </div>
        </div>
    );
};

export default RevenueCheck;
