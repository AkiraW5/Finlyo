// Este arquivo contém a lógica JavaScript para a aplicação, incluindo manipulação de eventos e interações com a interface do usuário.

document.addEventListener('DOMContentLoaded', () => {
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const transactionModal = document.getElementById('transactionModal');
    const closeTransactionModalBtn = document.getElementById('closeTransactionModalBtn');
    const cancelTransactionBtn = document.getElementById('cancelTransactionBtn');
    const transactionForm = document.getElementById('transactionForm');

    // Open modal
    addTransactionBtn.addEventListener('click', () => {
        transactionModal.classList.remove('hidden');
    });

    // Close modal
    closeTransactionModalBtn.addEventListener('click', () => {
        transactionModal.classList.add('hidden');
    });

    cancelTransactionBtn.addEventListener('click', () => {
        transactionModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    transactionModal.addEventListener('click', (e) => {
        if (e.target === transactionModal) {
            transactionModal.classList.add('hidden');
        }
    });

    // Form submission
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Here you would typically send the data to a server
        transactionModal.classList.add('hidden');
        alert('Transação adicionada com sucesso!');
    });

    // Initialize charts
    initializeCharts();
});

function initializeCharts() {
    const incomeExpenseCtx = document.getElementById('incomeExpenseChart').getContext('2d');
    const incomeExpenseChart = new Chart(incomeExpenseCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [
                {
                    label: 'Receitas',
                    data: [4500, 4800, 5000, 4900, 5100, 5200],
                    backgroundColor: '#10b981',
                },
                {
                    label: 'Despesas',
                    data: [3200, 3500, 3800, 3600, 3700, 3741],
                    backgroundColor: '#ef4444',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });

    const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
    const categoriesChart = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Outros'],
            datasets: [{
                data: [748.90, 1800, 180, 370.50, 100, 541.70],
                backgroundColor: [
                    '#ef4444',
                    '#3b82f6',
                    '#8b5cf6',
                    '#f59e0b',
                    '#10b981',
                    '#64748b'
                ],
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
        }
    });
}