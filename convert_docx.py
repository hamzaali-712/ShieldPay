import sys
import docx

def docx_to_md(docx_path, md_path):
    doc = docx.Document(docx_path)
    output = []
    
    def iter_block_items(parent):
        from docx.document import Document
        from docx.oxml.table import CT_Tbl
        from docx.oxml.text.paragraph import CT_P
        from docx.table import Table, _Cell
        from docx.text.paragraph import Paragraph

        if isinstance(parent, Document):
            parent_elm = parent.element.body
        elif isinstance(parent, _Cell):
            parent_elm = parent._tc
        else:
            raise ValueError("something's wrong")

        for child in parent_elm.iterchildren():
            if isinstance(child, CT_P):
                yield Paragraph(child, parent)
            elif isinstance(child, CT_Tbl):
                yield Table(child, parent)

    for block in iter_block_items(doc):
        if isinstance(block, docx.text.paragraph.Paragraph):
            text = block.text.strip()
            if not text:
                continue
            style_name = block.style.name.lower() if (block.style and hasattr(block.style, 'name')) else ''
            if 'heading 1' in style_name:
                output.append(f"\n# {text}\n")
            elif 'heading 2' in style_name:
                output.append(f"\n## {text}\n")
            elif 'heading 3' in style_name:
                output.append(f"\n### {text}\n")
            elif 'heading 4' in style_name:
                output.append(f"\n#### {text}\n")
            elif 'heading' in style_name:
                output.append(f"\n# {text}\n")
            elif 'bullet' in style_name or text.startswith('•') or text.startswith('-') or text.startswith('*'):
                clean_text = text.lstrip('•-* ').strip()
                output.append(f"- {clean_text}")
            else:
                output.append(text)
        elif isinstance(block, docx.table.Table):
            output.append("")
            for i, row in enumerate(block.rows):
                row_cells = []
                for cell in row.cells:
                    cell_txt = cell.text.replace("\n", " ").strip()
                    row_cells.append(cell_txt)
                row_str = "| " + " | ".join(row_cells) + " |"
                output.append(row_str)
                if i == 0:
                    sep = "| " + " | ".join(["---"] * len(row_cells)) + " |"
                    output.append(sep)
            output.append("")

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    print(f"Successfully converted {docx_path} to {md_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python convert_docx.py input.docx output.md")
    else:
        docx_to_md(sys.argv[1], sys.argv[2])
