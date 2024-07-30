<template>
  <section class="borrow-logs">
    <h2>Borrow Logs</h2>
    <ul>
      <li v-for="log in logs" :key="log.id" class="log-item">
        <div class="log-info">
          <span class="log-book">{{ log.bookTitle }}</span>
          <span class="log-user">borrowed by {{ log.user }}</span>
          <span class="log-date">{{ formatDate(log.startDate) }} to {{ formatDate(log.endDate) }}</span>
        </div>
        <div class="log-status" :class="getStatusClass(log)">
          {{ getStatus(log) }}
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
import { format, isToday, isBefore } from 'date-fns';

export default {
  name: 'BorrowLogs',
  props: {
    logs: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      try {
        return format(new Date(dateString), 'MMMM dd, yyyy');
      } catch (error) {
        return 'Invalid Date';
      }
    },
    getStatus(log) {
      const now = new Date();
      const endDate = new Date(log.endDate);
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
};
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
