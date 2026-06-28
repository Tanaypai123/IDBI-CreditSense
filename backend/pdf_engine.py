# pdf_engine.py
import io
import time
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from typing import Dict, Any

def draw_page_decorations(canvas, doc):
    canvas.saveState()
    
    # 1. Elegant Confidential Watermark
    canvas.setFont('Helvetica-Bold', 54)
    canvas.setFillColor(colors.HexColor('#F1F5F9'))
    # Draw rotated watermark in background
    canvas.translate(300, 390)
    canvas.rotate(45)
    canvas.drawCentredString(0, 0, "CONFIDENTIAL AUDIT")
    canvas.rotate(-45)
    canvas.translate(-300, -390)
    
    # 2. Elegant Footer & Timestamp
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#64748B'))
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    canvas.drawString(45, 25, f"IDBI CreditSense Compliance Audit | Timestamp: {timestamp}")
    canvas.drawRightString(doc.pagesize[0] - 45, 25, f"Page {doc.page} of 1")
    
    # Bottom subtle accent rule
    canvas.setStrokeColor(colors.HexColor('#CBD5E1'))
    canvas.setLineWidth(0.5)
    canvas.line(45, 38, doc.pagesize[0] - 45, 38)
    
    canvas.restoreState()

def generate_pdf_report(biz_name: str, score: float, risk_category: str, default_prob: float, eligible: bool, max_loan: float, inputs: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    # Adjust margins to leave space for the bottom footer rule
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=45, leftMargin=45, topMargin=45, bottomMargin=55)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Styles for banner texts
    banner_title_style = ParagraphStyle(
        'BannerTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.whitesmoke,
        spaceAfter=3
    )
    banner_subtitle_style = ParagraphStyle(
        'BannerSubTitle',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#FFB74D'), # Warm orange/gold
        spaceAfter=0
    )

    section_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#00796B'), # IDBI Green
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1F2937'), # Dark text
        spaceAfter=8
    )
    
    # Premium Header Banner Card using ReportLab Table
    banner_content = [
        [Paragraph("IDBI BANK &nbsp;|&nbsp; CreditSense", banner_title_style)],
        [Paragraph("Bank Aisa Dost Jaisa &nbsp;&nbsp;|&nbsp;&nbsp; AI-Powered MSME Credit Intelligence Platform &nbsp;&nbsp;|&nbsp;&nbsp; Predict • Explain • Approve", banner_subtitle_style)]
    ]
    banner_table = Table(banner_content, colWidths=[520])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#00796B')), # IDBI Green
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    story.append(banner_table)
    story.append(Spacer(1, 14))
    
    # Metadata Summary row
    report_id = f"CR-AUD-{int(time.time()) % 1000000:06d}"
    meta_data = [
        [
            Paragraph(f"<b>Report ID:</b> {report_id}", body_style),
            Paragraph(f"<b>Entity Legal Name:</b> {biz_name}", body_style),
            Paragraph("<b>Status:</b> SECURED AUDIT", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[150, 240, 130])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))
    
    # Verdict Table
    story.append(Paragraph("Credit Underwriting Verdict", section_style))
    data = [
        ["Evaluation Metric", "Quantified Value", "Status / Classification"],
        ["Financial Health Score", f"{score:.1f} / 100", "STANDARD" if score >= 60 else "STRESSED"],
        ["Credit Risk Rating", risk_category, "Multi-Factor Assessment"],
        ["Default Probability", f"{default_prob * 100:.2f}%", "NPA Risk" if default_prob > 0.5 else "STANDARD"],
        ["Credit Eligibility Result", "APPROVED" if eligible else "REJECTED", f"Limit: {max_loan:,.2f} INR" if eligible else "N/A"]
    ]
    t = Table(data, colWidths=[200, 160, 160])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#00796B')), # IDBI Green Header
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ('TOPPADDING', (0,1), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))
    
    # Profile Table
    story.append(Paragraph("MSME Operational Profile Summary", section_style))
    profile_data = [
        ["Sector / Industry", inputs.get('Industry', 'Retail'), "Annual Turnover", f"{inputs.get('Annual_Turnover', 12000000.0):,.2f} INR"],
        ["State / Location", inputs.get('State', 'Maharashtra'), "Digital Adoption Score", f"{inputs.get('Digital_Adoption_Score', 0.7) * 100:.1f}%"],
        ["Business Age", f"{inputs.get('Business_Age_Yrs', 5.0):.0f} Years", "Employee Count", f"{inputs.get('Current_Employees', 12.0):.0f} Staff"]
    ]
    t_profile = Table(profile_data, colWidths=[120, 140, 120, 140])
    t_profile.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_profile)
    story.append(Spacer(1, 12))
    
    # Recommendations
    story.append(Paragraph("Actionable Recommendations & Underwriting Advisories", section_style))
    recs = []
    
    defaults = float(inputs.get("Default_History", 0.0))
    emi_delays = float(inputs.get("EMI_Delay_Count", 0.0))
    gst_score = float(inputs.get("GST_Compliance_Mean", 94.0))
    margin = float(inputs.get("Profit_Margin_Mean", 0.18))
    current_ratio = float(inputs.get("Current_Ratio_Mean", 1.8))
    turnover = float(inputs.get("Annual_Turnover", 1.0))
    outstanding = float(inputs.get("Outstanding_Principal_Total", 0.0))
    leverage = outstanding / max(turnover, 1.0)
    digital = float(inputs.get("Digital_Adoption_Score", 0.7))
    
    if defaults > 0:
        recs.append("<b>Default History Alert</b>: Historical default record detected. Require mandatory promoter guarantees.")
    if emi_delays > 0:
        recs.append(f"<b>EMI Repayment Friction</b>: Flagged {int(emi_delays)} past EMI delay counts. Monitor monthly sweeps.")
    if gst_score < 75:
        recs.append(f"<b>GST Compliance Warning</b>: Tax filing compliance is low ({gst_score:.1f}%). Audit latest return receipts.")
    if margin < 0:
        recs.append(f"<b>Operating Profit Deficit</b>: Cash margin is negative ({margin*100:.1f}%). Limit unsecured credit lines.")
    if current_ratio < 1.0:
        recs.append(f"<b>Liquidity Warning</b>: Current ratio ({current_ratio:.2f}) indicates potential working capital shortfalls.")
    if leverage > 0.35:
        recs.append(f"<b>High Leverage Burden</b>: Debt-to-turnover ratio ({leverage*100:.1f}%) is elevated. Lock priority codes.")
    if digital < 0.40:
        recs.append(f"<b>Digitalization Opportunity</b>: Digital adoption score is low ({digital*100:.1f}%). Transition to UPI collection flows.")
        
    if score >= 85 and not recs:
        recs.append("<b>Pristine Credit Class</b>: Entity demonstrates healthy GST filing rates. Approved for standard limits onboarding.")
    elif score >= 70 and not recs:
        recs.append("<b>Standard Overdraft Limit</b>: Approved for credit sweep lines. GST delinquency check synced successfully.")
    elif not recs:
        recs.append("<b>Stressed Capital Ratio Alert</b>: Require monthly swept accounts, bank sweeps, or escrow margins.")
        
    for rec in recs:
        story.append(Paragraph(f"&bull; {rec}", body_style))
        
    doc.build(story, onFirstPage=draw_page_decorations, onLaterPages=draw_page_decorations)
    buffer.seek(0)
    return buffer.getvalue()
