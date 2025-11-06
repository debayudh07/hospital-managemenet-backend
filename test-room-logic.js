// Test room filtering logic
const beds = [
  { id: '1', bedNumber: 'Ward1-B001', wardName: 'Ward A' },
  { id: '2', bedNumber: 'Ward1-B002', wardName: 'Ward A' },
  { id: '3', bedNumber: 'Ward1-B003', wardName: 'Ward A' },
  { id: '4', bedNumber: 'Ward2-B001', wardName: 'Ward B' },
  { id: '5', bedNumber: 'Ward2-B002', wardName: 'Ward B' },
  { id: '6', bedNumber: 'Ward2-B003', wardName: 'Ward B' },
  { id: '7', bedNumber: 'Ward3-B001', wardName: 'Ward C' }
];

console.log('Total beds:', beds.length);
console.log('Expected rooms:', Math.ceil(beds.length / 4));

// Test room filtering
for (let roomNum = 1; roomNum <= Math.ceil(beds.length / 4); roomNum++) {
  const roomStartIndex = (roomNum - 1) * 4;
  const roomEndIndex = roomStartIndex + 4;
  const roomBeds = beds.slice(roomStartIndex, roomEndIndex);
  
  console.log(`Room ${roomNum}: beds ${roomStartIndex + 1}-${roomEndIndex}`);
  console.log('  Beds:', roomBeds.map(b => `${b.wardName}-${b.bedNumber}`));
}