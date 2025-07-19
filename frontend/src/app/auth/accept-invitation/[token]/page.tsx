import AcceptInvitationForm from '@/components/auth/AcceptInvitationForm';

interface AcceptInvitationPageProps {
  params: { token: string };
}

export default function AcceptInvitationPage({ params }: AcceptInvitationPageProps) {
  return <AcceptInvitationForm token={params.token} />;
}