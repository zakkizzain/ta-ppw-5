class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.inputIndicator = document.getElementById('inputIndicator');
        this.memoryValue = document.getElementById('memoryValue');
        this.historyList = document.getElementById('historyList');

        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.memory = 0;
        this.history = [];

        this.initializeEventListeners();
        this.loadHistory();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.btn-number').forEach(button => {
            button.addEventListener('click', () => this.handleNumber(button.textContent));
        });

        // Operator buttons
        const operatorMap = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };

        Object.entries(operatorMap).forEach(([id, op]) => {
            document.getElementById(id).addEventListener('click', () => this.handleOperator(op));
        });

        // Function buttons
        document.getElementById('clear').addEventListener('click', () => this.clear());
        document.getElementById('clearEntry').addEventListener('click', () => this.clearEntry());
        document.getElementById('decimal').addEventListener('click', () => this.addDecimal());
        document.getElementById('backspace').addEventListener('click', () => this.backspace());
        document.getElementById('equals').addEventListener('click', () => this.calculate());

        // Memory buttons
        document.getElementById('memoryAdd').addEventListener('click', () => this.memoryAdd());
        document.getElementById('memorySubtract').addEventListener('click', () => this.memorySubtract());
        document.getElementById('memoryRecall').addEventListener('click', () => this.memoryRecall());
        document.getElementById('memoryClear').addEventListener('click', () => this.memoryClear());

        // History
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistoryList());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        this.updateDisplay();
    }

    handleNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentValue = num;
            this.shouldResetDisplay = false;
        } else {
            if (this.currentValue === '0' && num !== '.') {
                this.currentValue = num;
            } else {
                this.currentValue += num;
            }
        }
        this.updateDisplay();
    }

    handleOperator(op) {
        if (this.operation !== null && !this.shouldResetDisplay) {
            this.calculateImmediate();
        }

        this.previousValue = this.currentValue;
        this.operation = op;
        this.shouldResetDisplay = true;
        this.inputIndicator.textContent = `${this.previousValue} ${this.operation}`;
        this.updateDisplay();
    }

    addDecimal() {
        if (this.shouldResetDisplay) {
            this.currentValue = '0.';
            this.shouldResetDisplay = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    backspace() {
        if (!this.shouldResetDisplay && this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else if (!this.shouldResetDisplay) {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.inputIndicator.textContent = '';
        this.updateDisplay();
    }

    calculateImmediate() {
        if (this.operation === null || this.shouldResetDisplay) return;

        const result = this.performOperation(
            parseFloat(this.previousValue),
            parseFloat(this.currentValue),
            this.operation
        );

        this.currentValue = String(result);
        this.operation = null;
        this.shouldResetDisplay = true;
    }

    calculate() {
        if (this.operation === null) return;

        const result = this.performOperation(
            parseFloat(this.previousValue),
            parseFloat(this.currentValue),
            this.operation
        );

        const calculation = `${this.previousValue} ${this.operation} ${this.currentValue} = ${result}`;
        this.addToHistory(calculation);

        this.currentValue = String(result);
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = true;
        this.inputIndicator.textContent = '';
        this.updateDisplay();
    }

    performOperation(prev, current, op) {
        let result;

        switch (op) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Tidak bisa membagi dengan nol');
                    return 0;
                }
                result = prev / current;
                break;
            default:
                return current;
        }

        // Round to avoid floating point errors
        return Math.round(result * 1000000000000) / 1000000000000;
    }

    showError(message) {
        this.display.value = message;
        this.display.classList.add('error');
        setTimeout(() => {
            this.display.classList.remove('error');
            this.clear();
        }, 2000);
    }

    // Memory Functions
    memoryAdd() {
        this.memory += parseFloat(this.currentValue) || 0;
        this.updateMemoryDisplay();
        this.shouldResetDisplay = true;
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentValue) || 0;
        this.updateMemoryDisplay();
        this.shouldResetDisplay = true;
    }

    memoryRecall() {
        this.currentValue = String(this.memory);
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    memoryClear() {
        this.memory = 0;
        this.updateMemoryDisplay();
    }

    updateMemoryDisplay() {
        this.memoryValue.textContent = `M: ${this.memory}`;
        localStorage.setItem('calculatorMemory', this.memory);
    }

    // History Functions
    addToHistory(calculation) {
        this.history.unshift(calculation);
        if (this.history.length > 5) {
            this.history.pop();
        }
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.updateHistoryDisplay();
        }

        const savedMemory = localStorage.getItem('calculatorMemory');
        if (savedMemory) {
            this.memory = parseFloat(savedMemory);
            this.updateMemoryDisplay();
        }
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="history-empty">Belum ada perhitungan</p>';
            return;
        }

        this.historyList.innerHTML = this.history
            .map((item, index) => `
                <div class="history-item" data-index="${index}">
                    <span class="history-text">${item}</span>
                    <button class="history-delete" data-index="${index}">×</button>
                </div>
            `)
            .join('');

        // Add click listeners to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('history-delete')) {
                    const resultMatch = item.textContent.match(/=\s*([\d.-]+)/);
                    if (resultMatch) {
                        this.currentValue = resultMatch[1];
                        this.shouldResetDisplay = true;
                        this.updateDisplay();
                    }
                }
            });
        });

        // Add delete listeners
        document.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.history.splice(index, 1);
                this.saveHistory();
                this.updateHistoryDisplay();
            });
        });
    }

    clearHistoryList() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    // Keyboard Support
    handleKeyboard(e) {
        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            this.handleNumber(e.key);
        }
        // Operators
        else if (e.key === '+') {
            e.preventDefault();
            this.handleOperator('+');
        } else if (e.key === '-') {
            e.preventDefault();
            this.handleOperator('−');
        } else if (e.key === '*') {
            e.preventDefault();
            this.handleOperator('×');
        } else if (e.key === '/') {
            e.preventDefault();
            this.handleOperator('÷');
        }
        // Decimal
        else if (e.key === '.') {
            e.preventDefault();
            this.addDecimal();
        }
        // Equals
        else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.calculate();
        }
        // Clear
        else if (e.key === 'Escape') {
            this.clear();
        }
        // Backspace
        else if (e.key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        }
    }

    updateDisplay() {
        // Format the display value
        let displayValue = this.currentValue;

        // Limit decimal places for display
        if (displayValue.includes('.')) {
            const parts = displayValue.split('.');
            if (parts[1] && parts[1].length > 10) {
                displayValue = parseFloat(displayValue).toPrecision(10);
            }
        }

        this.display.value = displayValue;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});