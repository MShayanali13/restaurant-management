

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { MenuType } from "@/types/MenuType";

const formatDate = () => new Date().toLocaleDateString();
const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const styles = StyleSheet.create({
  page: {
    padding: 6,
    fontSize: 5,
    fontFamily: "Helvetica",
    width: "2.8in", 
    height:"100vh",// For thermal printer width
  },
  header: {
    fontSize: 7,
    marginBottom: 2,
    textAlign: "center",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 4,
    textAlign: "center",
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 4,
    marginBottom: 2,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  divider: {
    borderBottom: "1px solid #000",
    marginVertical: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "0.5px solid #000",
    paddingBottom: 1,
    marginBottom: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1,
  },
  colItem: {
    width: "38%",
  },
  colQty: {
    width: "15%",
    textAlign: "center",
  },
  colRate: {
    width: "20%",
    textAlign: "right",
  },
  colAmount: {
    width: "25%",
    textAlign: "right",
  },
  totalLine: {
    borderTop: "1px solid #000",
    borderBottom: "1px solid #000",
    paddingVertical: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: "bold",
    marginTop: 3,
  },
  footer: {
    fontSize: 4,
    marginTop: 5,
    textAlign: "center",
  },
});

interface BillPDFProps {
  items: MenuType[];
  tableNumber: number;
  billNumber: string;
}

const BillPDF: React.FC<BillPDFProps> = ({ items, tableNumber, billNumber }) => {
  const total = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const cgst = (total * 0.025).toFixed(2);
  const sgst = (total * 0.025).toFixed(2);
  const grandTotal = (total + parseFloat(cgst) + parseFloat(sgst)).toFixed(2);

  return (
    <Document>
      <Page size="ID1" style={styles.page}>
        <Text style={styles.header}>🍽️ My Restaurant</Text>
        <Text style={styles.subHeader}>123 Main Street, City</Text>

        <View style={styles.infoRow}>
          <Text>Table No: {tableNumber}</Text>
          <Text>Bill No: {billNumber}</Text>
        </View>

        <View style={styles.dateTimeRow}>
          <Text>Date: {formatDate()}</Text>
          <Text>Time: {formatTime()}</Text>
        </View>

        <View style={styles.divider} />

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.colItem}>Item</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colRate}>Rate</Text>
          <Text style={styles.colAmount}>Amt</Text>
        </View>

        {/* Items */}
        {items.map((item) => (
          <View key={item._id} style={styles.row}>
            <Text style={styles.colItem}>{item.name}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colRate}>₹{item.price}</Text>
            <Text style={styles.colAmount}>
              ₹{(item.price * (item.quantity || 1)).toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalLine}>
          <Text>Total</Text>
          <Text>₹{total.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.colItem}>CGST 2.5%</Text>
          <Text style={styles.colAmount}>₹{cgst}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colItem}>SGST 2.5%</Text>
          <Text style={styles.colAmount}>₹{sgst}</Text>
        </View>

        <View style={styles.totalLine}>
          <Text>Grand Total</Text>
          <Text>₹{grandTotal}</Text>
        </View>

        <Text style={styles.footer}>Thanks! Visit Again 🙏</Text>
      </Page>
    </Document>
  );
};

export default BillPDF;
