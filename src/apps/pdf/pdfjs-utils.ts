import jsPDF from "jspdf";
import html2canvas from 'html2canvas';
import jszip from 'jszip';

const PdfManager = {

   async blob(element: any): Promise<Blob> {
      const pdf = await this.generate(element);
      return pdf.output("blob");
   },

   async save(element: any, filename: string) {
      const pdf = await this.generate(element);
      pdf.save(`${filename}.pdf`);
   },


   async getStableCanvas(element: any) {
      for (let i = 0; i < 10; i++) {
         const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
         });
      if (canvas.width > 0 && canvas.height > 0) return canvas;
      await new Promise(r => setTimeout(r, 50));
      }
      throw new Error("Failed to render canvas properly");
   },

   async generate(element: any): Promise<jsPDF> {
      const canvas = await this.getStableCanvas(element);

      const pdf = new jsPDF("p", "mm", "a4", true);
      const imgData = canvas.toDataURL("image/jpeg");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;//315
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
         pdf.addPage();
         position = - (imgHeight - heightLeft);
         pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
         heightLeft -= pageHeight;
      }
      return pdf;
   }
}

export { 
   PdfManager,
};