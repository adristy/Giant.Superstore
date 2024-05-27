
// Select all filter buttons and filterable cards
const filterButtons = document.querySelectorAll(".filter_button button");
const regionButtons = document.querySelectorAll(".region_button button")
const filterableCards = document.querySelectorAll(".filterable_cards .card");
const filterableInsight = document.querySelectorAll(".insight .card");

// Function to filter cards
const filterCards = e => {
    // Remove active class from all buttons and add it to the clicked button
    document.querySelector(".filter_button .active").classList.remove("active");
    e.target.classList.add("active");

    //iterate
    filterableCards.forEach(card =>{
        card.classList.add("hide");
        //match
        if(card.dataset.name === e.target.dataset.name || e.target.dataset.name === "all"){
            card.classList.remove("hide");
        }
    })

}
const filterRegion = (a) => {
    // Remove active class from all region buttons and add it to the clicked button
    document.querySelector(".region_button .active").classList.remove("active");
    a.target.classList.add("active");

    //iterate
    filterableInsight.forEach(card =>{
        card.classList.add("hide");
        //match
        if(card.dataset.name === a.target.dataset.name){
            card.classList.remove("hide");
        }
    })
}

// Add click event to all filter buttons
filterButtons.forEach(button => button.addEventListener("click", filterCards));
regionButtons.forEach(button => button.addEventListener("click", filterRegion));

// Filter Data
document.addEventListener("DOMContentLoaded", function() {
    const filterForm = document.getElementById('filterForm');
    const chartContainer = document.getElementById('chart-container');
    const netProfitElement = document.querySelector('[data-name="net.profit"] span');
    const revenueElement = document.querySelector('[data-name="revenue"] span');
    const ordersElement = document.querySelector('[data-name="total.orders"] span');

    // Event listener for dropdown filter changes
    filterForm.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function() {
            fetchData();
        });
    });

    function fetchData() {
        const year = document.getElementById('year').value;
        const discountType = document.getElementById('discountType').value;
        const region = document.getElementById('region').value;
        const segment = document.getElementById('segment').value;

        fetch('dataset.json')
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter(item => {
                    return (year === '' || item.Year.toString() === year) &&
                           (discountType === '' || item.DiscountType === discountType) &&
                           (region === '' || item.Region.toLowerCase().includes(region.toLowerCase())) &&
                           (segment === '' || item.Segment.toLowerCase().includes(segment.toLowerCase()));
                });

                // Sort the filtered data by Profit in descending order and get the top 10
                const top10Data = filteredData.sort((a, b) => b.Profit - a.Profit).slice(0, 15);

                renderTable(top10Data);
                renderBarChart(filteredData);
                updateNetProfit(filteredData);
                updateRevenue(filteredData);
                updateOrders(filteredData);
                renderPieChart(filteredData);
                renderSubCatChart(filteredData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function renderTable(data) {
        const table = document.getElementById('dataTable');
        table.innerHTML = ''; // Clear existing content

        const columns = ['Order ID', 'Customer Name', 'Segment', 'Region','Country', 'Category', 'Sub-Category', 'Sales', 'Profit'];
        
        // Create table header
        const headerRow = document.createElement('tr');
        columns.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create table rows
        data.forEach(item => {
            const row = document.createElement('tr');
            columns.forEach(header => {
                const cell = document.createElement('td');
                cell.textContent = item[header.replace(' ', '')]; // Match object keys to column names
                row.appendChild(cell);
            });
            table.appendChild(row);
        });
    }

    // Function to update net profit
    function updateNetProfit(data) {
        const totalProfit = data.reduce((acc, item) => {
            return acc + item.Profit;
        }, 0);
        const roundedProfit = Math.round(totalProfit);
        netProfitElement.textContent = roundedProfit.toLocaleString('en-US');
    }

    // Function to update revenue
    function updateRevenue(data) {
        const totalRevenue = data.reduce((acc, item) => {
            return acc + item['Sales'];
        }, 0);
        revenueElement.textContent = totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2});
    }

    // Function update total orders
    function updateOrders(data) {
        const orderCount = data.length;
        ordersElement.textContent = orderCount;
    }

    function renderBarChart(data) {
        const categorySales = data.reduce((acc, item) => {
            const category = item['Category'];
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        // Aggregate sales by category
        const categorySumSales = data.reduce((acc, item) => {
            const category = item['Category'];
            const sales = item['Sales'];
            acc[category] = (acc[category] || 0) + sales;
            return acc;
        }, {});

        const categories = Object.keys(categorySales);
        const orderCounts = Object.values(categorySales);
        const revenueSum = Object.values(categorySumSales);

        // Clear previous chart
        chartContainer.innerHTML = '';

        // Create canvas for chart
        const canvas = document.createElement('canvas');
        canvas.id = 'order-chart';
        chartContainer.appendChild(canvas);
        canvas.width = 800; // Set desired width
        canvas.height = 700; // Set desired height

        // Render bar chart
        const ctx = canvas.getContext('2d');
        const orderChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: '',
                    data: orderCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(201, 203, 207, 0.2)'],
                    borderColor: [ 'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                  ],
                    borderWidth: 1,
                    borderRadius: 10
                }]
            },
            options: {
                plugins: {
                    datalabels: {
                        color: 'black',
                        anchor: 'end',
                        align: 'top',
                        font: {
                            size: 11,
                            family: 'Montserrat',
                            weight: 'bold'
                        },
                        formatter: function(orderCounts) {
                            return orderCounts;
                        }
                    },
                    legend: {
                        display: false // Menyembunyikan legenda
                    },
                    title: {
                        display: true,
                        text: 'Total Orders',
                        font: {
                            size: 20, // Ukuran font title
                            family: 'Arial',
                            color: 'black'
                        },
                        position: 'top', // Posisi title
                        align: 'center', // Rata tengah
                        padding: {
                            top: 20,
                            bottom: 0
                        }
                    },
                    subtitle: {
                        display: true,
                        text: 'Count of OrderID for every categories',
                        font: {
                            size: 11,
                            style : 'italic'
                        },
                        position: 'top',
                        align: 'center',
                        padding: {
                            top: 0,
                            bottom: 20
                        }
                }},
                scales: {
                    y: {
                        grid: {
                            display: false // Menghilangkan grid background pada sumbu y
                        },
                        ticks: {
                            beginAtZero: true,
                            display: false // Menghilangkan angka pada sumbu y
                        }
                    },
                    x: {
                        grid: {
                            display: false // Menghilangkan grid background pada sumbu x
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 0, // Tambahkan ruang di bagian atas
                        bottom: 0 // Tambahkan ruang di bagian bawah
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    function renderPieChart(data) {
        const categorySumSales = data.reduce((acc, item) => {
            const category = item['Segment'];
            const sales = item['Quantity'];
            acc[category] = (acc[category] || 0) + sales;
            return acc;
        }, {});
    
        const segments = Object.keys(categorySumSales);
        const revenueSum = Object.values(categorySumSales);
    
        // Menghitung total sales untuk persentase
        const totalSales = revenueSum.reduce((acc, value) => acc + value, 0);
        const percentageSales = revenueSum.map(value => (value / totalSales * 100).toFixed(2));
    
        // Clear previous chart
        const pieChartContainer = document.getElementById('pie-chart-container');
        pieChartContainer.innerHTML = '';
    
        // Create canvas for pie chart
        const pieCanvas = document.createElement('canvas');
        pieCanvas.id = 'pie-chart';
        pieChartContainer.appendChild(pieCanvas);
        pieCanvas.width = 800; // Set desired width
        pieCanvas.height = 600; // Set desired height
    
        // Render pie chart
        const ctx = pieCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: segments,
                datasets: [{
                    label: 'Sales by Category',
                    data: revenueSum,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(201, 203, 207, 0.2)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                        'rgb(201, 203, 207)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    datalabels: {
                        color: 'black',
                        align: 'center',
                        offset: -2,
                        font: {
                            size: 10,
                            family: 'Montserrat',
                            weight: 'bold'
                        },
                        formatter: function(value, context) {
                            const percentage = (value / totalSales * 100).toFixed(2);
                            return `${percentage}%`;
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        font : {
                            size: 10,
                            family: 'Montserrat'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Products Sold',
                        font: {
                            size: 20,
                            family: 'Arial',
                            color: 'black'
                        },
                        position: 'top',
                        align: 'center',
                        padding: {
                            top: 20,
                            bottom: 0
                        }
                    },
                    subtitle: {
                        display: true,
                        text: 'Sum of products sold in every segment',
                        font: {
                            size: 11,
                            style : 'italic'
                        },
                        position: 'top',
                        align: 'center',
                        padding: {
                            top: 0,
                            bottom: 10
                        }}
                },
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
    
    // DOUGHNUT CHART NEW CUSTOMER
        // Clear previous chart
        const newCustChartContainer = document.getElementById('newcust-chart-container');
        newCustChartContainer.innerHTML = '';
    
        // Create canvas for new cust chart
        const newcustCanvas = document.createElement('canvas');
        newcustCanvas.id = 'newcust-chart';
        newCustChartContainer.appendChild(newcustCanvas);
    
        // Render new cust chart
        const ctx = newcustCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Discount','Low Discount','Moderate Discount','Big Discount'],
                datasets: [{
                    label: '',
                    data: [18, 255, 68, 452],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(201, 203, 207, 0.2)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                        'rgb(201, 203, 207)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    // datalabels: {
                    //     color: 'black',
                    //     align: 'center',
                    //     offset: -2,
                    //     font: {
                    //         size: 11,
                    //         family: 'Montserrat'
                    //     }
                    // },
                    legend: {
                        display: true,
                        position: 'bottom',
                        font : {
                            size: 10,
                            family: 'Montserrat'
                        }
                    },
                    title: {
                        display: true,
                        text: 'New Customers',
                        font: {
                            size: 20,
                            family: 'Arial',
                            color: 'black'
                        },
                        position: 'top',
                        align: 'center',
                        padding: {
                            top: 20,
                            bottom: 0
                        }
                    },
                    subtitle: {
                        display: true,
                        text: 'Discounts affect to reach a new customer',
                        font: {
                            size: 11,
                            style : 'italic'
                        },
                        position: 'top',
                        align: 'center',
                        padding: {
                            top: 0,
                            bottom: 10
                        }
                }},
                layout: {
                    padding: {
                        top: 0,
                        bottom: 0
                    }
                }
            },
        });

   // CHART SALES AND PROFIT SUB CATEGORY
   function renderSubCatChart(data) {
    // Aggregate total orders
    const subcategorySales = data.reduce((acc, item) => {
        const category = item['Sub-Category'];
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    // Aggregate profit by category
    const subcategorySumProfit = data.reduce((acc, item) => {
        const category = item['Sub-Category'];
        const profit = item['Profit'];
        acc[category] = (acc[category] || 0) + profit;
        return acc;
    }, {});

    // Create arrays from the objects
    const categories = Object.keys(subcategorySales);
    const orderCounts = Object.values(subcategorySales);

    // Combine the arrays for sorting
    const combinedData = categories.map((category, index) => ({
        category: category,
        orders: orderCounts[index],
        profit: subcategorySumProfit[category]
    }));

    // Sort by total orders in descending order
    combinedData.sort((a, b) => b.orders - a.orders);

    // Extract sorted arrays
    const sortedCategories = combinedData.map(item => item.category);
    const sortedOrderCounts = combinedData.map(item => item.orders);
    const sortedProfitSum = combinedData.map(item => item.profit);

    // Clear previous chart
    const subcatChartContainer = document.getElementById('subcat-chart-container');
    subcatChartContainer.innerHTML = '';

    // Create canvas for chart
    const subcatCanvas = document.createElement('canvas');
    subcatCanvas.id = 'subcatSalesProfit';
    subcatChartContainer.appendChild(subcatCanvas);
    subcatCanvas.width = 2300; // Set desired width
    subcatCanvas.height = 800; // Set desired height

    // Render combined bar and line chart
    const ctx = subcatCanvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedCategories,
            datasets: [
                {
                    label: 'Profit',
                    data: sortedProfitSum,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.3
                },
                {
                    label: 'Total Orders',
                    data: sortedOrderCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 10,
                    yAxisID: 'y1',
                }
                
            ]
        },
        options: {
            plugins: {
                datalabels: {
                    color: 'black',
                    anchor: 'end',
                    align: 'top',
                    font: {
                        size: 11,
                        family: 'Montserrat',
                        weight: 'bold'
                    },
                    formatter: function(value) {
                        return value;
                    }
                },
                legend: {
                    display: true // Show legend to differentiate datasets
                },
                title: {
                    display: true,
                    text: 'Total Orders and Profit by Sub-Category',
                    font: {
                        size: 20,
                        family: 'Arial',
                        color: 'black'
                    },
                    position: 'top',
                    align: 'center',
                    padding: {
                        top: 20,
                        bottom: 0
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Count of Orders and Profit for each sub-category',
                    font: {
                        size: 11,
                        style : 'italic'
                    },
                    position: 'top',
                    align: 'center',
                    padding: {
                        top: 0,
                        bottom: 10
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: false,
                    position: 'left',
                    grid: {
                        display: false // Hide grid background on y-axis
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                    title: {
                        display: true,
                        text: 'Total Orders'
                    }
                },
                y1: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    grid: {
                        display: false // Hide grid background on y1-axis
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                    title: {
                        display: true,
                        text: 'Profit'
                    }
                },
                x: {
                    grid: {
                        display: false // Hide grid background on x-axis
                    }
                }
            },
            layout: {
                padding: {
                    top: 0,
                    bottom: 0
                }
            }
        }
    });
}

//  // TIME SERIES CHART

        
    fetchData();
    
});

// TIME SERIES PLOT
document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('timeSeriesChart').getContext('2d');
    ctx.canvas.width = 1850;
    ctx.canvas.height = 600;
    const startDate = new Date(2014, 0);
    const labels = [];
  
    for (let i = 0; i < 60; i++) {
        const date = moment(startDate).add(i, 'month').format('MMM YY');
        labels.push(date.toString());
      }
  
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual',
            data: [
                700.8582, 425.738, 1547.784, 1652.7844, 1337.9199, 1397.7249, 1621.0695, 2009.0801, 2990.1721, 1507.2472, 
                3531.3333, 2843.8627, 546.9656, 572.3874, 1296.3157, 1589.5722, 1895.7726, 1514.3524, 2085.184, 1814.2809, 
                3183.1298, 2007.706, 4040.9709, 3969.2926, 1240.4443, 1205.0789, 1486.9192, 1574.3275, 2190.1513, 2285.7975, 
                1972.5572, 2145.7673, 3830.3873, 1926.0226, 3966.7285, 4010.3565, 1442.3047, 1160.939, 3111.7735, 1578.7114, 
                2641.6122, 2602.6133, 2863.2486, 2924.4128, 5050.2648, 3006.7287, 4669.7443, 5477.2403],
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            borderColor: 'rgba(54, 162, 235, 1)'
          },
          {
            label: 'Predicted',
            data: [
                428.12686, 303.9629915, 1061.198661, 903.7216545, 1559.273003, 1341.169284, 
                1585.149766, 1599.269826, 3025.3829, 1588.800327, 3625.507046, 3412.028498, 
                826.8945382, 702.7306697, 1459.966339, 1302.489333, 1958.040681, 1739.936962, 
                1983.917444, 1998.037505, 3424.150578, 1987.568005, 4024.274724, 3810.796177, 
                1225.662216, 1101.498348, 1858.734017, 1701.257011, 2356.808359, 2138.704641, 
                2382.685122, 2396.805183, 3822.918256, 2386.335683, 4423.042402, 4209.563855, 
                1624.429895, 1500.266026, 2257.501695, 2100.024689, 2755.576037, 2537.472319, 
                2781.4528, 2795.572861, 4221.685934, 2785.103362, 4821.810081, 4608.331533, 
                2023.2, 1899.03, 2656.27, 2498.79, 3154.34, 2936.24, 3180.22, 3194.34, 
                4620.45, 3183.87, 5220.58, 5007.1],
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      },
      options: {
        scales: {
            x: {
                type: 'category',
                labels: labels,
                grid: {
                  display: false, // Menghilangkan grid lines
                },
                title: {
                  display: false,
                  text: 'Month',
                  font: {
                    size: 18 // Ukuran font judul sumbu x
                  }
                },
                ticks: {
                  font: {
                    size: 11 // Ukuran font label sumbu x
                  }
                }
              },
          y: {
            display: true,
            grid: {
              display: false,
            },
            title: {
              display: false,
              text: 'Value'
            }
          }
        },
        plugins: {
          title: {
                    display: true,
                    text: 'Time Series Chart of Profit',
                    font: {
                        size: 20,
                        family: 'Arial',
                        color: 'black'
                    },
                    position: 'top',
                    align: 'center',
                    padding: {
                        top: 20,
                        bottom: 0
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Time series chart actual vs predicted',
                    font: {
                        size: 13,
                        style : 'italic'
                    },
                    position: 'top',
                    align: 'center',
                    padding: {
                        top: 0,
                        bottom: 10
                    }
                },
                legend: {
                    display: true,
                    position: 'top', // Atur posisi legend ke bawah
                    labels: {
                      font: {
                        size: 10
                      }
                    }
                  }
        },
        elements: {
          line: {
            tension: 0.2
          }
        }
      }
    });
  });
