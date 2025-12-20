from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

def create_whisper_house_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=LETTER,
        rightMargin=72, leftMargin=72,
        topMargin=72, bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles to match the "Cormorant Garamond" / Art aesthetic
    # We use Times-Roman as a standard serif substitute for portability
    
    # Title Style (Lowercase, large)
    style_title = ParagraphStyle(
        'WhisperTitle',
        parent=styles['Heading1'],
        fontName='Times-Roman',
        fontSize=36,
        leading=42,
        alignment=TA_CENTER,
        textColor=colors.black,
        spaceAfter=10
    )

    # Subtitle (Italic)
    style_subtitle = ParagraphStyle(
        'WhisperSubtitle',
        parent=styles['Italic'],
        fontName='Times-Italic',
        fontSize=14,
        alignment=TA_CENTER,
        textColor=colors.gray,
        spaceAfter=30
    )

    # Section Headers
    style_h2 = ParagraphStyle(
        'WhisperH2',
        parent=styles['Heading2'],
        fontName='Times-Bold',
        fontSize=18,
        leading=22,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.black
    )
    
    # Body Text
    style_body = ParagraphStyle(
        'WhisperBody',
        parent=styles['BodyText'],
        fontName='Times-Roman',
        fontSize=11,
        leading=15,
        alignment=TA_JUSTIFY,
        spaceAfter=10
    )

    # Small Caps / Meta tags
    style_meta = ParagraphStyle(
        'WhisperMeta',
        parent=styles['BodyText'],
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=colors.gray,
        textTransform='uppercase',
        spaceAfter=2
    )
    
    # Blockquotes
    style_quote = ParagraphStyle(
        'WhisperQuote',
        parent=styles['BodyText'],
        fontName='Times-Italic',
        fontSize=12,
        leftIndent=20,
        rightIndent=20,
        spaceBefore=10,
        spaceAfter=10,
        textColor=colors.darkgray
    )

    story = []

    # --- HEADER ---
    story.append(Paragraph("whisper house", style_title))
    story.append(HRFlowable(width="20%", thickness=0.5, color=colors.lightgrey, spaceAfter=10, spaceBefore=0))
    story.append(Paragraph("A performance, a document, a ritual.", style_subtitle))
    story.append(Spacer(1, 20))

    # --- DEFINITION ---
    story.append(Paragraph("What is whisper house?", style_h2))
    story.append(Paragraph("<b>whisper house</b> is simultaneously a sound composition, a piece of literature, a fictional document, a performance art piece, experimental theater, a conceptual art piece, and a ritual. It is designed to function as any—or all—of these practices.", style_body))
    
    # Definitions List (Using a Table for grid-like layout)
    def_data = [
        [Paragraph("<b>As Composition:</b> The piece explores sounds created by the 'Guests'—sounds mediated by the house through space and distance.", style_body)],
        [Paragraph("<b>As Literature:</b> A poetic, experimental, visual-musical text that can simply be read.", style_body)],
        [Paragraph("<b>As Ritual:</b> The act of reading or performing the text constitutes a ritual. Its impossible acts resemble Zen koans.", style_body)],
        [Paragraph("<b>As Conceptual Art:</b> The idea itself, enacted only in the mind, is the work. The surreal instructions are 'impossible instructions.'", style_body)]
    ]
    t_defs = Table(def_data, colWidths=['100%'])
    t_defs.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0), (-1,-1), 6)]))
    story.append(t_defs)
    
    story.append(Spacer(1, 10))
    story.append(Paragraph('"There are many instructions in the piece that are surreal, impossible, or invisible. Participants may interpret these as they wish."', style_quote))

    story.append(PageBreak())

    # --- LOGISTICS ---
    story.append(Paragraph("Performance Notes", style_h2))
    story.append(Paragraph("The piece features four performers, referred to as <b>Guests</b>.", style_body))
    
    bullets = [
        "The fourth Guest will not act until the very end.",
        "Guest 1 begins with a phone or laptop.",
        "Guest 3 begins with an encyclopedia.",
        "Unspecified details are left to the performers' interpretation."
    ]
    for b in bullets:
        story.append(Paragraph(f"• {b}", style_body))
        
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Location Requirement:</b> Must be performed in a house. There should be at least one room with a door and a doorknob.", style_body))

    # Materials
    story.append(Paragraph("Materials Needed", style_h2))
    
    materials_data = [
        [Paragraph("<b>Books & Paper</b>", style_body), Paragraph("Encyclopedia, Dictionary, Novel, Envelope", style_body)],
        [Paragraph("<b>Kitchen</b>", style_body), Paragraph("Frying Pan & Egg, Pitcher, Water, Cutlery, Vegetables", style_body)],
        [Paragraph("<b>Household</b>", style_body), Paragraph("Landline Phone, Radio, Electric Fan, Laundry Basket, Broom, Shell, Medicine", style_body)],
    ]
    t_mat = Table(materials_data, colWidths=[120, 300])
    t_mat.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_mat)

    story.append(Spacer(1, 20))

    # --- PROGRAM NOTES ---
    story.append(Paragraph("Program Notes", style_h2))
    
    story.append(Paragraph("CONCEPT", style_meta))
    story.append(Paragraph("whisper house imagines a household vigil where individuals must constantly check on something—or someone—quite fragile. Like a holding pattern of care, they must move through the house gently.", style_body))
    
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey, spaceAfter=15, spaceBefore=15))

    story.append(Paragraph("<b>First Inspiration (The Cats):</b> The slow decline of our family cats. Suffering from feline immunodeficiency virus, their health degraded in a slow, predictable fade.", style_body))
    story.append(Paragraph("<b>Second Inspiration (Sickness):</b> The memory of my own sicknesses as a child. I heard the house through a filter: the distant sound of ironing, the sizzle of frying food.", style_body))
    story.append(Paragraph("<b>Third Inspiration (Grandfather):</b> My grandfather drifted in and out of the hospital. It was an intense vigil that continued even when he was hospitalized.", style_body))
    story.append(Paragraph("<b>Fourth Inspiration (Siblings):</b> The birth of my significantly younger siblings. They were so tiny, kept in a cradle in a quiet room. Always quiet. Always gentle.", style_body))

    story.append(Paragraph('"So, this is what whisper house tries to embody. There’s a presence in the piece of something fragile, at the cusp of life and death."', style_quote))

    # --- QUESTIONS ---
    story.append(PageBreak())
    story.append(Paragraph("This piece asks questions", style_h2))
    story.append(Paragraph("I leave many things open and unexplained because I want this piece to provoke inquiry.", style_body))
    
    questions = [
        "Who are the audience, really?",
        "What is the house?",
        "Who—or what—is really being cared for?",
        "What is fragile here?",
        "Why are the Guests 'guests'?",
        "How many characters are in this piece?"
    ]
    
    for q in questions:
        story.append(Paragraph(f"? {q}", style_body))

    # Build
    doc.build(story)
    print(f"PDF successfully generated as: {filename}")

# Execute
create_whisper_house_pdf("Whisper_House_Program_Notes.pdf")