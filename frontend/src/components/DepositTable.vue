<template>
  <div>
    <div v-if="deposits.length === 0" class="muted">Belum ada data.</div>
    <table v-else>
      <thead>
        <tr>
          <th>Lapak</th>
          <th>Mitra</th>
          <th>Produk</th>
          <th>Masuk</th>
          <th>Terjual</th>
          <th>Sisa</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="d in deposits" :key="d.id">
          <tr v-for="it in d.items" :key="it.id">
            <td>{{ d.lapak?.name }}</td>
            <td>{{ d.mitra?.name }}</td>
            <td>{{ it.product?.name }}</td>
            <td>{{ it.initialQty }}</td>
            <td>{{ it.soldQty }}</td>
            <td>{{ it.remainingQty }}</td>
            <td>
              <span v-if="d.status === 'CLOSED'" class="badge gray">Ditutup</span>
              <span v-else class="badge green">Buka</span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({ deposits: { type: Array, default: () => [] } })
</script>
