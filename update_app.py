import os
import re

filepath = "src/App.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if 'import { AffiliateDashboard } from "./components/AffiliateDashboard";' not in content:
    content = content.replace(
        'import { AnalyticsDashboard } from "./components/AnalyticsDashboard";',
        'import { AnalyticsDashboard } from "./components/AnalyticsDashboard";\nimport { AffiliateDashboard } from "./components/AffiliateDashboard";'
    )

# 2. Add global useEffect for tracking affiliate code inside App component
# Let's find "export default function App() {"
app_start = "export default function App() {"
if "localStorage.setItem('simba_affiliate_ref'" not in content:
    useEffect_tracking = """
  // Affiliate Tracking Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("simba_affiliate_ref", ref);
      // Optional: record click
      try {
        addDoc(collection(db, "affiliate_clicks"), {
          affiliateCode: ref,
          createdAt: serverTimestamp(),
          userAgent: navigator.userAgent
        });
      } catch(e) {}
    }
  }, []);
"""
    content = content.replace(app_start, app_start + "\n" + useEffect_tracking)


# 3. Add to routes
if '<Route path="/affiliate"' not in content:
    content = content.replace(
        '<Routes>',
        '<Routes>\n            <Route path="/affiliate" element={<AffiliateDashboard />} />'
    )

# 4. Modify Donation Payload to include Affiliate info
payload_declaration = """      const payload = {
        name: donorName || "Hamba Allah",
        phone: donorPhone || "",
        email: donorEmail || "",
        date: new Date().toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        program: selectedProgramForDonation.title,
        amount: valAmount,
        status: "Berhasil",
        method:
          selectedPaymentMethod === "shopeepay"
            ? "ShopeePay"
            : selectedPaymentMethod === "gopay"
              ? "GoPay"
              : selectedPaymentMethod === "bsi"
                ? "BSI Virtual Account"
                : selectedPaymentMethod === "bca"
                  ? "BCA Virtual Account"
                  : selectedPaymentMethod,
        createdAt: serverTimestamp(),
      };"""

replacement_payload = """      const affiliateRef = localStorage.getItem("simba_affiliate_ref");
      const commission = affiliateRef ? valAmount * 0.05 : 0;
      
      const payload: any = {
        name: donorName || "Hamba Allah",
        phone: donorPhone || "",
        email: donorEmail || "",
        date: new Date().toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        program: selectedProgramForDonation.title,
        amount: valAmount,
        status: "Berhasil",
        method:
          selectedPaymentMethod === "shopeepay"
            ? "ShopeePay"
            : selectedPaymentMethod === "gopay"
              ? "GoPay"
              : selectedPaymentMethod === "bsi"
                ? "BSI Virtual Account"
                : selectedPaymentMethod === "bca"
                  ? "BCA Virtual Account"
                  : selectedPaymentMethod,
        createdAt: serverTimestamp(),
      };
      
      if (affiliateRef) {
        payload.affiliateCode = affiliateRef;
        payload.affiliateCommission = commission;
      }"""

if "simba_affiliate_ref" not in content and "const payload = {" in content:
    # We will use regex to find the payload creation inside handleDonation or similar
    # It might be safer to replace around "await addDoc(collection(db, \"users\", uid, \"donations\"), payload);"
    # Let's write a small patch around that.
    pass

# Another approach for donation:
# Find: await addDoc(collection(db, "users", uid, "donations"), payload);
adddoc_statement = 'await addDoc(collection(db, "users", uid, "donations"), payload);'
adddoc_replacement = """        const affiliateRef = localStorage.getItem("simba_affiliate_ref");
        if (affiliateRef) {
          payload.affiliateCode = affiliateRef;
          payload.affiliateCommission = payload.amount * 0.05;
          
          // Add to affiliate earnings
          await addDoc(collection(db, "affiliate_earnings"), {
             affiliateCode: affiliateRef,
             commission: payload.affiliateCommission,
             donorName: payload.name,
             program: payload.program,
             amount: payload.amount,
             createdAt: serverTimestamp()
          });
        }
        
        await addDoc(collection(db, "users", uid, "donations"), payload);"""

if "affiliate_earnings" not in content:
    content = content.replace(adddoc_statement, adddoc_replacement)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx successfully.")
