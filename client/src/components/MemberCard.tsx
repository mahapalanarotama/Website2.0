import { useState } from "react";
// Update the import path below to the actual location of your Member type definition
// Define the Member type locally if the import is missing
export interface Member {
  id: string;
  fullName: string;
  registrationNumber: string;
  membershipStatus: string;
  photoUrl?: string;
  fieldName?: string;
  batchName?: string;
  batchYear?: string | number;
}
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, User } from "lucide-react";

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    setPrinting(true);
    const printContent = document.getElementById('printable-card');
    const originalContents = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      setPrinting(false);
      window.location.reload();
    }
  };

  const qrValue = JSON.stringify({
    id: member.id,
    name: member.fullName,
    registrationNumber: member.registrationNumber,
    status: member.membershipStatus
  });

  return (
    <div className="max-w-md mx-auto">
      <Card className="mb-4 border-2 border-primary overflow-hidden">
        <div id="printable-card">
          <CardHeader className="bg-primary text-white p-4 flex items-center justify-between">
            <div>
              <h4 className="font-heading font-bold">MAHAPALA NAROTAMA</h4>
              <p className="text-xs">Universitas Narotama Surabaya</p>
            </div>
            <div className="text-right">
              <p className="text-xs">ID: {member.registrationNumber}</p>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex">
              <div className="mr-4">
                <div className="w-24 h-32 bg-gray-200 rounded-md flex items-center justify-center">
                  {member.photoUrl ? (
                    <img 
                      src={member.photoUrl} 
                      alt={member.fullName} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium">Nama</td>
                      <td className="py-1">: {member.fullName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Nama Lapangan</td>
                      <td className="py-1">: {member.fieldName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Angkatan</td>
                      <td className="py-1">: {member.batchName} {member.batchYear}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Status</td>
                      <td className="py-1">: 
                        <span className={`${member.membershipStatus === 'Aktif' ? 'text-green-600' : 'text-amber-600'} font-medium ml-1`}>
                          {member.membershipStatus}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="p-2 bg-white rounded-md">
                <QRCodeSVG value={qrValue} size={128} />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={handlePrint}
          disabled={printing}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Cetak Kartu
        </Button>
      </div>
    </div>
  );
}
