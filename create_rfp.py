from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="RFP Requirements", ln=1, align="C")
pdf.multi_cell(0, 10, txt="""1. The supplier must provide 24/7 support.
2. The supplier must provide encrypted storage for all data.
3. The supplier must provide 99.9% availability.
4. The system must include a certified security module.
5. The system must support regular automated backups.
6. The supplier must have a response time of under 1 hour.""")
pdf.output("real_rfp.pdf")
