// admin.js

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggles = document.querySelectorAll('.sidebar-toggle');
    const loginModal = document.getElementById('loginModal');
    const closeModalButton = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('login-message');
    const logoutButton = document.getElementById('logout-button');
    const navLinks = document.querySelectorAll('nav ul li a');
    const mainContentArea = document.getElementById('main-content-area');
    const mainContentTitle = document.getElementById('main-content-title');

    // Admin Profile Elements
    const adminNameElement = document.getElementById('admin-name');
    const adminRoleElement = document.getElementById('admin-role');

    // Dashboard Stats Elements
    const totalOrdersElement = document.getElementById('total-orders');
    const approvalPendingElement = document.getElementById('approval-pending');
    const activeUsersElement = document.getElementById('active-users');
    const totalRevenueElement = document.getElementById('total-revenue');
    const ordersChangeElement = document.getElementById('orders-change');
    const pendingChangeElement = document.getElementById('pending-change');
    const usersChangeElement = document.getElementById('users-change');
    const revenueChangeElement = document.getElementById('revenue-change');

    // Table and List Body Elements
    const recentOrdersTableBody = document.getElementById('recent-orders-table-body');
    const vehicleCategoriesList = document.getElementById('vehicle-categories-list');

    // --- Authentication and Modal Logic ---

    // Function to show/hide the login modal
    function toggleLoginModal(show) {
        if (show) {
            loginModal.classList.remove('hidden');
        } else {
            loginModal.classList.add('hidden');
            loginMessage.classList.add('hidden'); // Clear any previous messages
            loginForm.reset(); // Reset form fields
        }
    }

    // Check if admin is authenticated on page load
    async function checkAdminAuth() {
        try {
            // In a real application, you'd send a request to a PHP script
            // that checks for an active admin session.
            // For now, we'll simulate it.
            const response = await fetch('admin_check_auth.php'); // Hypothetical PHP endpoint
            const data = await response.json();

            if (data.authenticated && data.isAdmin) {
                // Admin is authenticated, hide modal and load data
                toggleLoginModal(false);
                adminNameElement.textContent = data.name || 'Admin';
                adminRoleElement.textContent = data.role || 'Super Admin';
                loadDashboardData();
            } else {
                // Not authenticated, show login modal
                toggleLoginModal(true);
            }
        } catch (error) {
            console.error('Error checking admin authentication:', error);
            toggleLoginModal(true); // Show modal on error
        }
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const bank = document.getElementById('bank').value; // This might be optional for Super Admin

        if (!email || !password) {
            loginMessage.textContent = 'Please enter email and password.';
            loginMessage.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('admin_login.php', { // Hypothetical PHP endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, bank })
            });
            const data = await response.json();

            if (data.success) {
                loginMessage.textContent = data.message;
                loginMessage.classList.remove('hidden');
                loginMessage.classList.remove('text-red-500');
                loginMessage.classList.add('text-green-500');
                // Simulate successful login, then hide modal and load dashboard
                setTimeout(() => {
                    toggleLoginModal(false);
                    adminNameElement.textContent = data.adminName || 'Admin';
                    adminRoleElement.textContent = data.adminRole || 'Super Admin';
                    loadDashboardData();
                }, 1000); // Give user time to read success message
            } else {
                loginMessage.textContent = data.message || 'Login failed. Please try again.';
                loginMessage.classList.remove('hidden');
                loginMessage.classList.remove('text-green-500');
                loginMessage.classList.add('text-red-500');
            }
        } catch (error) {
            console.error('Login request failed:', error);
            loginMessage.textContent = 'An error occurred during login. Please try again later.';
            loginMessage.classList.remove('hidden');
            loginMessage.classList.remove('text-green-500');
            loginMessage.classList.add('text-red-500');
        }
    });

    // Close modal button
    closeModalButton.addEventListener('click', () => {
        // You might want to prevent closing if not logged in, or redirect to a public page
        // For now, we'll just hide it.
        toggleLoginModal(false);
    });

    // Handle logout
    logoutButton.addEventListener('click', async () => {
        try {
            const response = await fetch('admin_logout.php'); // Hypothetical PHP endpoint
            const data = await response.json();

            if (data.success) {
                alert('Logged out successfully!'); // Replace with a custom modal later
                window.location.reload(); // Reload to show login modal
            } else {
                alert(data.message || 'Logout failed.');
            }
        } catch (error) {
            console.error('Logout request failed:', error);
            alert('An error occurred during logout.');
        }
    });

    // --- Sidebar Toggle Logic (for mobile responsiveness) ---
    sidebarToggles.forEach(button => {
        button.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    });

    // --- Dynamic Content Loading ---

    // Function to load dashboard data
    async function loadDashboardData() {
        try {
            const response = await fetch('admin_dashboard_data.php'); // Hypothetical PHP endpoint
            const data = await response.json();

            if (data.success) {
                // Update stats cards
                totalOrdersElement.textContent = data.stats.totalOrders.toLocaleString();
                approvalPendingElement.textContent = data.stats.approvalPending.toLocaleString();
                activeUsersElement.textContent = data.stats.activeUsers.toLocaleString();
                totalRevenueElement.textContent = `₹${data.stats.totalRevenue.toLocaleString()}`;

                // Update change percentages (add logic to determine color/icon based on positive/negative)
                ordersChangeElement.textContent = `${data.stats.ordersChange}%`;
                pendingChangeElement.textContent = `${data.stats.pendingChange}%`;
                usersChangeElement.textContent = `${data.stats.usersChange}%`;
                revenueChangeElement.textContent = `${data.stats.revenueChange}%`;

                // Render Recent Orders
                renderRecentOrders(data.recentOrders);

                // Render Vehicle Categories
                renderVehicleCategories(data.vehicleCategories);

            } else {
                console.error('Failed to load dashboard data:', data.message);
                // Display error message on dashboard
                mainContentArea.innerHTML = `<p class="text-red-500 text-center">Failed to load dashboard data: ${data.message}</p>`;
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            mainContentArea.innerHTML = `<p class="text-red-500 text-center">Error connecting to server to load dashboard data.</p>`;
        }
    }

    // Function to render recent orders table
    function renderRecentOrders(orders) {
        recentOrdersTableBody.innerHTML = ''; // Clear existing rows
        if (orders.length === 0) {
            recentOrdersTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No recent orders found.</td></tr>';
            return;
        }

        orders.forEach(order => {
            let statusClass = '';
            if (order.status === 'Completed') {
                statusClass = 'bg-green-100 text-green-800';
            } else if (order.status === 'Pending') {
                statusClass = 'bg-yellow-100 text-yellow-800';
            } else if (order.status === 'Processing') {
                statusClass = 'bg-blue-100 text-blue-800';
            } else if (order.status === 'Rejected') {
                statusClass = 'bg-red-100 text-red-800';
            }

            const row = `
                <tr class="border-b border-gray-100">
                    <td class="py-3 text-sm">${order.orderId}</td>
                    <td class="py-3 text-sm">${order.vehicle}</td>
                    <td class="py-3 text-sm">${order.bank}</td>
                    <td class="py-3 text-sm">
                        <span class="${statusClass} text-xs px-2 py-1 rounded">${order.status}</span>
                    </td>
                    <td class="py-3 text-sm text-right">
                        <button class="text-indigo-600 hover:text-indigo-800">View</button>
                    </td>
                </tr>
            `;
            recentOrdersTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // Function to render vehicle categories list
    function renderVehicleCategories(categories) {
        vehicleCategoriesList.innerHTML = ''; // Clear existing items
        if (categories.length === 0) {
            vehicleCategoriesList.innerHTML = '<p class="text-center py-4 text-gray-500">No vehicle categories found.</p>';
            return;
        }

        categories.forEach(category => {
            let iconClass = '';
            let bgColorClass = '';
            // Assign icons and colors based on category name (or a category_id from backend)
            if (category.name.includes('Car') || category.name.includes('Jeep') || category.name.includes('Van')) {
                iconClass = 'fas fa-car';
                bgColorClass = 'bg-indigo-100 text-indigo-600';
            } else if (category.name.includes('LCV')) {
                iconClass = 'fas fa-truck';
                bgColorClass = 'bg-green-100 text-green-600';
            } else if (category.name.includes('Pickup')) {
                iconClass = 'fas fa-truck-pickup';
                bgColorClass = 'bg-yellow-100 text-yellow-600';
            } else if (category.name.includes('Bus') || category.name.includes('Truck')) {
                iconClass = 'fas fa-bus';
                bgColorClass = 'bg-blue-100 text-blue-600';
            } else if (category.name.includes('Heavy')) {
                iconClass = 'fas fa-truck-monster';
                bgColorClass = 'bg-purple-100 text-purple-600';
            } else {
                 iconClass = 'fas fa-car'; // Default icon
                 bgColorClass = 'bg-gray-100 text-gray-600'; // Default color
            }


            const item = `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div class="flex items-center">
                        <div class="w-8 h-8 ${bgColorClass} rounded-md flex items-center justify-center mr-3">
                            <i class="${iconClass} text-sm"></i>
                        </div>
                        <div>
                            <p class="font-medium text-sm">${category.name}</p>
                            <p class="text-xs text-gray-500">${category.tagsCount}+ Tags</p>
                        </div>
                    </div>
                    <span class="text-sm text-gray-500">₹${category.price}</span>
                </div>
            `;
            vehicleCategoriesList.insertAdjacentHTML('beforeend', item);
        });
    }

    // --- Tab Switching Logic ---
    function showTab(tabId) {
        // Hide all content areas
        document.querySelectorAll('#main-content-area > div').forEach(content => {
            content.classList.add('hidden');
        });

        // Show the selected content area
        const selectedContent = document.getElementById(`${tabId}-content`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
            // Update main content title
            const tabName = navLinks.find(link => link.dataset.tab === tabId).textContent.trim();
            mainContentTitle.textContent = tabName;
        }

        // Update active class in sidebar
        navLinks.forEach(link => {
            link.classList.remove('active-tab');
        });
        const activeLink = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeLink) {
            activeLink.classList.add('active-tab');
        }

        // Close sidebar on mobile after tab selection
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = e.currentTarget.dataset.tab;
            showTab(tabId);

            // If it's the dashboard, reload data
            if (tabId === 'dashboard') {
                loadDashboardData();
            }
            // You can add specific data loading for other tabs here too
        });
    });


    // Initial check for authentication and load dashboard
    checkAdminAuth();
});
