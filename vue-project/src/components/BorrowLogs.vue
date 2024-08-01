  <template>
    <section class="borrow-logs">
      <h2>Borrow Logs</h2>
      <ul v-if="logs && logs.length > 0">
        <li v-for="log in logs" :key="log.id" class="log-item">
          <div class="log-info">
            <span class="log-book">{{ log.bookTitle || 'Unknown Book' }}</span>
            <span class="log-user">borrowed by {{ log.userName || 'N/A' }}</span>
            <span class="log-date">{{ formatDate(log.borrowDate) }} to {{ formatDate(log.returnDate) }}</span>
          </div>
          <div class="log-status" :class="getStatusClass(log)">
            {{ getStatus(log) }}
          </div>
        </li>
      </ul>
      <p v-else>No borrow logs available.</p>
    </section>
  </template>

  <script>
  import { format, isToday, isBefore, parseISO } from 'date-fns';

  export default {
    name: 'BorrowLogs',
    props: {
      logs: {
        type: Array,
        required: true,
        default: () => []
      }
    },
    mounted() {
      console.log('Received logs:', this.logs);
      this.logs.forEach((log, index) => {
        console.log(`Log ${index}:`, {
          bookTitle: log.bookTitle,
          userName: log.userName,
          borrowDate: log.borrowDate,
          returnDate: log.returnDate
        });
      });
    },
    updated() {
      console.log('Updated logs:', this.logs);
    },
    methods: {
      formatDate(dateString) {
        if (!dateString || dateString === 'N/A') return 'N/A';
        try {
          // Check if dateString is a valid timestamp
          const timestamp = Number(dateString);
          if (!isNaN(timestamp)) {
            return format(new Date(timestamp), 'MMMM dd, yyyy');
          }
          // If not a timestamp, try to parse as ISO string
          return format(parseISO(dateString), 'MMMM dd, yyyy');
        } catch (error) {
          console.error('Error formatting date:', error, dateString);
          return 'Invalid Date';
        }
      },
      getStatus(log) {
        if (!log.returnDate || log.returnDate === 'N/A') {
          return 'Active';
        }
        
        let endDate;
        try {
          endDate = typeof log.returnDate === 'string' ? parseISO(log.returnDate) : new Date(log.returnDate);
        } catch (error) {
          console.error('Error parsing return date:', error, log.returnDate);
          return 'Invalid Date';
        }

        const now = new Date();
        
        if (isBefore(endDate, now) && !isToday(endDate)) {
          return 'Overdue';
        } else if (isToday(endDate)) {
          return 'Due Today';
        } else {
          return 'Active';
        }
      },
      getStatusClass(log) {
        const status = this.getStatus(log);
        return {
          'status-overdue': status === 'Overdue',
          'status-active': status === 'Active',
          'status-due': status === 'Due Today'
        };
      }
    }
  }
  </script>



  <style scoped>
  .borrow-logs {
    background-color: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #2c3e50;
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  .log-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #ecf0f1;
    transition: background-color 0.3s ease;
  }

  .log-item:last-child {
    border-bottom: none;
  }

  .log-item:hover {
    background-color: #f7f9fc;
  }

  .log-info {
    display: flex;
    flex-direction: column;
  }

  .log-book {
    font-weight: 500;
    color: #2c3e50;
  }

  .log-user, .log-date {
    font-size: 0.9rem;
    color: #7f8c8d;
  }

  .log-status {
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .status-overdue {
    background-color: #e74c3c;
    color: white;
  }

  .status-active {
    background-color: #2ecc71;
    color: white;
  }

  .status-due {
    background-color: #f39c12;
    color: white;
  }
  </style>
